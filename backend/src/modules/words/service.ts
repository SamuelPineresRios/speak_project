/**
 * Fichas de palabras y vocabulario personal.
 *
 * `lookupWord` responde al hover de la escena y del chat: la ficha se genera
 * con IA la primera vez y queda cacheada en `word_lookups` para todos los
 * alumnos, de modo que cada palabra se paga una sola vez. `saveWord` la añade
 * al vocabulario del alumno y `listSavedWords` lo devuelve completo.
 */
import { randomUUID } from 'node:crypto'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '../../db/client.ts'
import { saved_words, word_lookups, type WordExample } from '../../db/schema.ts'
import { completeChat } from '../../lib/ai.ts'
import { HttpError } from '../../utils/http-error.ts'
import { WORD_SCHEMA, WORD_SYSTEM_PROMPT } from './prompts.ts'

/** Tope del contexto: una frase de diálogo, no un texto entero. */
const MAX_CONTEXT_LENGTH = 300

export interface WordCard {
  id: string
  word: string
  translation: string
  part_of_speech: string
  present: string | null
  past: string | null
  past_participle: string | null
  examples: WordExample[]
  /** true si el alumno que consulta ya la tiene guardada. */
  saved: boolean
  /** Sólo en el vocabulario: identificador, fecha y frase de guardado. */
  saved_id?: string
  saved_at?: string
  context?: string | null
}

/** Clave de la caché: minúsculas y sin puntuación en los extremos. */
export function normalizeWord(raw: string): string {
  return raw.trim().toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, '')
}

function readWord(raw: unknown): string {
  const word = normalizeWord(typeof raw === 'string' ? raw : '')
  if (!word || word.length > 64) {
    throw new HttpError(400, 'Palabra no válida')
  }
  return word
}

function readContext(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().slice(0, MAX_CONTEXT_LENGTH) : ''
}

interface LookupRow {
  id: string
  word: string
  translation: string
  part_of_speech: string
  present: string | null
  past: string | null
  past_participle: string | null
  examples: WordExample[]
}

function toCard(row: LookupRow, saved: boolean): WordCard {
  return {
    id: row.id,
    word: row.word,
    translation: row.translation,
    part_of_speech: row.part_of_speech,
    present: row.present,
    past: row.past,
    past_participle: row.past_participle,
    examples: row.examples,
    saved,
  }
}

async function findLookup(word: string): Promise<LookupRow | undefined> {
  const rows = await db.select().from(word_lookups).where(eq(word_lookups.word, word)).limit(1)
  return rows[0]
}

async function isSaved(studentId: string, lookupId: string): Promise<boolean> {
  const rows = await db
    .select({ id: saved_words.id })
    .from(saved_words)
    .where(and(eq(saved_words.student_id, studentId), eq(saved_words.word_lookup_id, lookupId)))
    .limit(1)
  return rows.length > 0
}

/** Genera la ficha con el modelo (una sola vez por palabra). */
async function generateCard(
  word: string,
  context: string,
): Promise<Omit<LookupRow, 'id' | 'word'>> {
  const raw = await completeChat({
    messages: [
      { role: 'system', content: WORD_SYSTEM_PROMPT },
      { role: 'user', content: `Palabra: ${word}\nFrase: ${context || '(sin frase)'}` },
    ],
    maxTokens: 800,
    schema: WORD_SCHEMA,
  })

  const parsed = JSON.parse(raw) as Omit<LookupRow, 'id' | 'word'>
  return {
    translation: String(parsed.translation ?? '').trim() || '—',
    part_of_speech: String(parsed.part_of_speech ?? '').trim() || 'word',
    present: parsed.present ?? null,
    past: parsed.past ?? null,
    past_participle: parsed.past_participle ?? null,
    examples: Array.isArray(parsed.examples) ? parsed.examples.slice(0, 3) : [],
  }
}

/**
 * Ficha de una palabra, de caché o generada al vuelo.
 *
 * Si dos peticiones piden la misma palabra a la vez, las dos pueden generar,
 * pero sólo una escribe: la otra lee lo que quedó (clave única por palabra).
 */
export async function lookupWord(
  studentId: string,
  rawWord: unknown,
  rawContext: unknown,
): Promise<WordCard> {
  const word = readWord(rawWord)
  const context = readContext(rawContext)

  const cached = await findLookup(word)
  if (cached) return toCard(cached, await isSaved(studentId, cached.id))

  const generated = await generateCard(word, context)
  const inserted = await db
    .insert(word_lookups)
    .values({ id: randomUUID(), word, ...generated })
    .onConflictDoNothing({ target: word_lookups.word })
    .returning()

  const row = inserted[0] ?? (await findLookup(word))
  if (!row) throw new HttpError(500, 'No se pudo guardar la ficha de la palabra')
  return toCard(row, false)
}

/** Añade la palabra al vocabulario del alumno; repetir no duplica. */
export async function saveWord(
  studentId: string,
  rawWord: unknown,
  rawContext: unknown,
): Promise<WordCard> {
  const card = await lookupWord(studentId, rawWord, rawContext)
  const context = readContext(rawContext)

  await db
    .insert(saved_words)
    .values({
      id: randomUUID(),
      student_id: studentId,
      word_lookup_id: card.id,
      context: context || null,
    })
    .onConflictDoNothing({ target: [saved_words.student_id, saved_words.word_lookup_id] })

  return { ...card, saved: true }
}

/** Vocabulario del alumno, de lo más reciente a lo más antiguo. */
export async function listSavedWords(studentId: string): Promise<WordCard[]> {
  const rows = await db
    .select({
      saved_id: saved_words.id,
      saved_at: saved_words.created_at,
      context: saved_words.context,
      lookup: word_lookups,
    })
    .from(saved_words)
    .innerJoin(word_lookups, eq(saved_words.word_lookup_id, word_lookups.id))
    .where(eq(saved_words.student_id, studentId))
    .orderBy(desc(saved_words.created_at))

  return rows.map(row => ({
    ...toCard(row.lookup, true),
    saved_id: row.saved_id,
    saved_at: row.saved_at.toISOString(),
    context: row.context,
  }))
}

/** Quita una palabra del vocabulario; sólo si es suya. */
export async function deleteSavedWord(studentId: string, id: string): Promise<void> {
  const deleted = await db
    .delete(saved_words)
    .where(and(eq(saved_words.id, id), eq(saved_words.student_id, studentId)))
    .returning({ id: saved_words.id })

  if (deleted.length === 0) throw new HttpError(404, 'Palabra no encontrada')
}
