/**
 * Rutas HTTP de guías (montadas en `/api/guides`).
 */
import { Router } from 'express'
import type { CefrLevel } from '@vox/shared'
import { requireAuth, sessionOf } from '../../middleware/require-auth.ts'
import { HttpError } from '../../utils/http-error.ts'
import { queryString, routeParam } from '../../utils/route-params.ts'
import {
  getGuideById,
  listChatMessages,
  listGuides,
  markGuideCompleted,
  recordExerciseSubmission,
  sendChatMessage,
} from './service.ts'

export const guidesRouter = Router()

guidesRouter.get('/', requireAuth, async (req, res) => {
  const cefrLevel = queryString(req, 'cefr_level')
  const conceptTag = queryString(req, 'concept_tag')

  const data = await listGuides({
    // Sin validar a propósito: un valor desconocido simplemente no casa con
    // ninguna fila (la columna es de texto), igual que antes.
    cefrLevel: cefrLevel as CefrLevel | null,
    conceptTag,
  })

  res.json({ guides: data })
})

guidesRouter.get('/:id', requireAuth, async (req, res) => {
  const guide = await getGuideById(routeParam(req, 'id'))
  if (!guide) throw new HttpError(404, 'Guide not found')

  // `content` viaja como jsonb con la forma completa que consume la UI
  // (introduction, definition, key_structures, exercises, ...), así que la
  // fila se devuelve tal cual.
  res.json({ guide })
})

guidesRouter.get('/:id/chat', requireAuth, async (req, res) => {
  const session = sessionOf(req)
  const messages = await listChatMessages(session.userId, routeParam(req, 'id'))

  res.json({ success: true, messages })
})

guidesRouter.post('/:id/chat', requireAuth, async (req, res) => {
  const session = sessionOf(req)
  const content = typeof req.body?.content === 'string' ? req.body.content : ''

  if (!content) throw new HttpError(400, 'Message content is required')

  const exchange = await sendChatMessage(session.userId, routeParam(req, 'id'), content)
  res.json({ success: true, ...exchange })
})

guidesRouter.post('/:id/mark-completed', requireAuth, async (req, res) => {
  const session = sessionOf(req)
  const rawScore = (req.body ?? {}).score
  const score =
    typeof rawScore === 'number' && Number.isFinite(rawScore) ? Math.round(rawScore) : 100

  const progress = await markGuideCompleted(session.userId, routeParam(req, 'id'), score)
  res.json({ success: true, message: 'Guide marked as completed', progress })
})

guidesRouter.post('/:id/exercise-submission', requireAuth, async (req, res) => {
  const session = sessionOf(req)
  const body = (req.body ?? {}) as Record<string, unknown>

  const exerciseId = typeof body.exercise_id === 'string' ? body.exercise_id : ''
  if (!exerciseId || body.selected_answer === undefined) {
    throw new HttpError(400, 'Missing exercise_id or selected_answer')
  }

  const rawAnswer = body.selected_answer
  const selectedAnswer =
    rawAnswer === null ? null : typeof rawAnswer === 'string' ? rawAnswer : String(rawAnswer)

  const submission = await recordExerciseSubmission({
    studentId: session.userId,
    guideId: routeParam(req, 'id'),
    exerciseId,
    selectedAnswer,
    isCorrect: typeof body.is_correct === 'boolean' ? body.is_correct : null,
  })

  res.json({ success: true, submission })
})
