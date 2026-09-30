/**
 * Lógica de dominio de las guías: listado y detalle, chat del tutor,
 * marcado de completado y registro de ejercicios.
 */
import { and, asc, eq, sql, type SQL } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import type { CefrLevel } from '@vox/shared'
import { completeChat } from '../../lib/ai.ts'
import { db } from '../../db/client.ts'
import {
  chat_messages,
  exercise_submissions,
  guide_progress,
  guides,
  type GuideContent,
} from '../../db/schema.ts'
import { HttpError } from '../../utils/http-error.ts'
import { buildTutorSystemPrompt } from './prompts.ts'

export type GuideRow = typeof guides.$inferSelect
export type ChatMessageRow = typeof chat_messages.$inferSelect
export type GuideProgressRow = typeof guide_progress.$inferSelect
export type ExerciseSubmissionRow = typeof exercise_submissions.$inferSelect

export interface GuideFilters {
  cefrLevel?: CefrLevel | null
  conceptTag?: string | null
}

export async function listGuides(filters: GuideFilters = {}): Promise<GuideRow[]> {
  const conditions: SQL[] = []

  if (filters.cefrLevel) conditions.push(eq(guides.cefr_level, filters.cefrLevel))
  if (filters.conceptTag) {
    // concept_tags es jsonb; equivalente al `contains` de PostgREST (`@>`).
    conditions.push(sql`${guides.concept_tags} @> ${JSON.stringify([filters.conceptTag])}::jsonb`)
  }

  const query = db.select().from(guides)
  return conditions.length ? await query.where(and(...conditions)) : await query
}

export async function getGuideById(guideId: string): Promise<GuideRow | null> {
  const [guide] = await db.select().from(guides).where(eq(guides.id, guideId)).limit(1)
  return guide ?? null
}

/** Historial de chat de un alumno en una guía, en orden cronológico. */
export async function listChatMessages(
  studentId: string,
  guideId: string,
): Promise<ChatMessageRow[]> {
  return db
    .select()
    .from(chat_messages)
    .where(and(eq(chat_messages.guide_id, guideId), eq(chat_messages.student_id, studentId)))
    .orderBy(asc(chat_messages.sent_at))
}

/** Respuesta del tutor; nunca lanza: ante un fallo devuelve un aviso. */
async function generateTutorReply(message: string, guide: GuideRow): Promise<string> {
  try {
    console.log('[CHAT] 🚀 Llamando OpenRouter/Gemini...')
    const response = await completeChat({
      messages: [
        { role: 'system', content: buildTutorSystemPrompt(guide) },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      maxTokens: 1024,
    })
    console.log('[CHAT] ✅ Respuesta recibida')
    return response
  } catch (err) {
    console.error('[CHAT] Error generando respuesta:', err)
    return 'Disculpa, hubo un error. Intenta de nuevo.'
  }
}

export interface ChatExchange {
  userMessage: ChatMessageRow
  assistantMessage: ChatMessageRow
}

/**
 * Persiste el par pregunta/respuesta.
 *
 * La llamada a la IA ocurre fuera de la transacción (es una llamada de red y
 * no debe mantener abierta una transacción), pero los dos INSERT son atómicos:
 * igual que antes, o se guardan ambos mensajes o ninguno.
 */
export async function sendChatMessage(
  studentId: string,
  guideId: string,
  content: string,
): Promise<ChatExchange> {
  const guide = await getGuideById(guideId)
  if (!guide) throw new HttpError(404, 'Guide not found')

  const assistantContent = await generateTutorReply(content, guide)
  const now = new Date()

  return db.transaction(async tx => {
    const [userMessage] = await tx
      .insert(chat_messages)
      .values({
        id: randomUUID(),
        guide_id: guideId,
        student_id: studentId,
        role: 'user',
        content,
        sent_at: now,
      })
      .returning()

    const [assistantMessage] = await tx
      .insert(chat_messages)
      .values({
        id: randomUUID(),
        guide_id: guideId,
        student_id: studentId,
        role: 'assistant',
        content: assistantContent,
        sent_at: new Date(),
      })
      .returning()

    if (!userMessage || !assistantMessage) {
      throw new Error('Los INSERT de chat no devolvieron las filas creadas')
    }

    return { userMessage, assistantMessage }
  })
}

/** Marca la guía como completada; crea el progreso si no existía. */
export async function markGuideCompleted(
  studentId: string,
  guideId: string,
  score: number,
): Promise<GuideProgressRow> {
  const guide = await getGuideById(guideId)
  if (!guide) throw new HttpError(404, 'Guide not found')

  const exercisesTotal = guide.content?.exercises?.length ?? 0
  const now = new Date()

  const [progress] = await db
    .insert(guide_progress)
    .values({
      id: randomUUID(),
      student_id: studentId,
      guide_id: guideId,
      status: 'completed',
      exercises_completed: exercisesTotal,
      exercises_total: exercisesTotal,
      started_at: now,
      completed_at: now,
      score,
    })
    .onConflictDoUpdate({
      target: [guide_progress.student_id, guide_progress.guide_id],
      set: {
        status: 'completed',
        completed_at: now,
        exercises_completed: exercisesTotal,
        exercises_total: exercisesTotal,
        score,
      },
    })
    .returning()

  if (!progress) throw new Error('El upsert de guide_progress no devolvió la fila')
  return progress
}

export interface ExerciseSubmissionInput {
  studentId: string
  guideId: string
  exerciseId: string
  selectedAnswer: string | null
  isCorrect: boolean | null
}

export async function recordExerciseSubmission(
  input: ExerciseSubmissionInput,
): Promise<ExerciseSubmissionRow> {
  // La guía se valida antes para no acabar en una violación de FK (500).
  const [guide] = await db
    .select({ id: guides.id })
    .from(guides)
    .where(eq(guides.id, input.guideId))
    .limit(1)
  if (!guide) throw new HttpError(404, 'Guide not found')

  const [submission] = await db
    .insert(exercise_submissions)
    .values({
      id: randomUUID(),
      guide_id: input.guideId,
      exercise_id: input.exerciseId,
      student_id: input.studentId,
      selected_answer: input.selectedAnswer,
      is_correct: input.isCorrect,
      submitted_at: new Date(),
    })
    .returning()

  if (!submission) throw new Error('El INSERT de exercise_submissions no devolvió la fila')
  return submission
}

export type { GuideContent }
