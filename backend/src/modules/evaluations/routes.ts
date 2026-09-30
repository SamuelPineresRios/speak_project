/**
 * Ruta HTTP de evaluaciones (montada en `/api/evaluations`).
 */
import { eq } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../db/client.ts'
import { evaluations, responses } from '../../db/schema.ts'
import { ownsResource } from '../../lib/authorization.ts'
import { requireAuth, sessionOf } from '../../middleware/require-auth.ts'
import { HttpError } from '../../utils/http-error.ts'
import { routeParam } from '../../utils/route-params.ts'

export const evaluationsRouter = Router()

evaluationsRouter.get('/:id', requireAuth, async (req, res) => {
  const session = sessionOf(req)

  const [row] = await db
    .select({ evaluation: evaluations, student_id: responses.student_id })
    .from(evaluations)
    .innerJoin(responses, eq(responses.id, evaluations.response_id))
    .where(eq(evaluations.id, routeParam(req, 'id')))
    .limit(1)

  if (!row) throw new HttpError(404, 'Evaluation not found')

  // La evaluación sólo es visible para el alumno que produjo la respuesta y
  // para sus profesores.
  if (!ownsResource(session, row.student_id, ['teacher'])) {
    throw new HttpError(403, 'Forbidden')
  }

  res.json({ evaluation: row.evaluation })
})
