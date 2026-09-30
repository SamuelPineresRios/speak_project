/**
 * Ruta HTTP de métricas de administración (montada en `/api/admin`).
 *
 * El acceso no depende del rol sino de `ADMIN_EMAILS`: un administrador puede
 * ser profesor o alumno.
 */
import { Router } from 'express'
import { env } from '../../config/env.ts'
import { requireAuth, sessionOf } from '../../middleware/require-auth.ts'
import { HttpError } from '../../utils/http-error.ts'
import { getAdminMetrics } from './service.ts'

export const adminRouter = Router()

adminRouter.get('/metrics', requireAuth, async (req, res) => {
  const session = sessionOf(req)

  if (!env.adminEmails.includes(session.email.toLowerCase())) {
    throw new HttpError(403, 'Forbidden')
  }

  res.json(await getAdminMetrics())
})
