/**
 * Rutas HTTP de alumnos (montadas en `/api/students`).
 */
import { Router } from 'express'
import { ownsResource } from '../../lib/authorization.ts'
import { requireAuth, sessionOf } from '../../middleware/require-auth.ts'
import { HttpError } from '../../utils/http-error.ts'
import { queryInt, routeParam } from '../../utils/route-params.ts'
import {
  getSessionSummary,
  getWeeklyStats,
  joinGroup,
  listStudentGroups,
} from './service.ts'

export const studentsRouter = Router()

studentsRouter.get('/groups', requireAuth, async (req, res) => {
  const session = sessionOf(req)
  const data = await listStudentGroups(session.userId)
  res.status(200).json(data)
})

studentsRouter.post('/join-group', requireAuth, async (req, res) => {
  const session = sessionOf(req)
  const accessCode = typeof req.body?.access_code === 'string' ? req.body.access_code : ''

  if (!accessCode.trim()) throw new HttpError(400, 'access_code required')

  const result = await joinGroup(session.userId, accessCode)

  // Ya era miembro: 200 con `already_member`. Alta nueva: 201 con `joined`.
  if (result.already_member) {
    res.json(result)
    return
  }

  res.status(201).json(result)
})

studentsRouter.get('/:id/weekly-stats', requireAuth, async (req, res) => {
  const session = sessionOf(req)
  const studentId = routeParam(req, 'id')

  if (!ownsResource(session, studentId, ['teacher'])) throw new HttpError(403, 'Forbidden')

  res.json(await getWeeklyStats(studentId))
})

studentsRouter.get('/:id/session-summary', requireAuth, async (req, res) => {
  const session = sessionOf(req)
  const studentId = routeParam(req, 'id')

  if (!ownsResource(session, studentId, ['teacher'])) throw new HttpError(403, 'Forbidden')

  res.json(await getSessionSummary(studentId, queryInt(req, 'week_offset', 0)))
})
