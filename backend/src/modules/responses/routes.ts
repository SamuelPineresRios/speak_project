/**
 * Ruta HTTP de respuestas (montada en `/api/responses`).
 */
import { eq } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../db/client.ts'
import { responses } from '../../db/schema.ts'
import { ownsResource } from '../../lib/authorization.ts'
import { requireAuth, sessionOf } from '../../middleware/require-auth.ts'
import { HttpError } from '../../utils/http-error.ts'
import { routeParam } from '../../utils/route-params.ts'

export const responsesRouter = Router()

responsesRouter.get('/:id', requireAuth, async (req, res) => {
  const session = sessionOf(req)

  const [response] = await db
    .select()
    .from(responses)
    .where(eq(responses.id, routeParam(req, 'id')))
    .limit(1)

  if (!response) throw new HttpError(404, 'Response not found')

  if (!ownsResource(session, response.student_id, ['teacher'])) {
    throw new HttpError(403, 'Forbidden')
  }

  res.json({ response })
})
