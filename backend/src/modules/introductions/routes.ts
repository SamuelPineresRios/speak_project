/**
 * Rutas HTTP de las introducciones narrativas (montadas en `/api/missions`).
 *
 * - GET  /:id/introduction -> la escena guardada, o la genera al vuelo
 * - POST /:id/introduction/regenerate -> escena nueva (sólo docentes)
 */
import { Router } from 'express'
import { requireAuth, requireTeacher } from '../../middleware/require-auth.ts'
import { HttpError } from '../../utils/http-error.ts'
import { routeParam } from '../../utils/route-params.ts'
import { getOrCreateIntroduction, regenerateIntroduction } from './service.ts'

export const introductionsRouter = Router()

/**
 * La primera petición de una misión paga la generación (varios segundos):
 * se avisa al cliente devolviendo un 202-style estado en el propio JSON para
 * que la UI pueda distinguir "recién generada" de "cacheada".
 */
introductionsRouter.get('/:id/introduction', requireAuth, async (req, res) => {
  const missionId = routeParam(req, 'id')

  const row = await getOrCreateIntroduction(missionId)
  if (!row) throw new HttpError(404, 'Introduction not found')

  res.json({ introduction: row })
})

introductionsRouter.post('/:id/introduction/regenerate', requireTeacher, async (req, res) => {
  const missionId = routeParam(req, 'id')

  const row = await regenerateIntroduction(missionId)
  res.json({ introduction: row })
})
