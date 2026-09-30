/**
 * Espejo de autorización global para la API (antes `middleware.ts`).
 *
 * Toda `/api/*` exige sesión salvo las rutas públicas, y `/api/teachers/*`
 * exige rol `teacher`. Cada router vuelve a comprobar lo que necesita
 * (`requireAuth` / `requireTeacher`), pero este guard es la garantía global:
 * una ruta nueva sin guard propio sigue cerrada por defecto.
 */
import type { RequestHandler } from 'express'
import { isPublicPath, isTeacherPath } from '@vox/shared'
import { HttpError } from '../utils/http-error.ts'

export const apiAccessGuard: RequestHandler = (req, _res, next) => {
  const { path } = req

  if (!path.startsWith('/api/')) return next()
  if (isPublicPath(path)) return next()
  if (!req.session) return next(new HttpError(401, 'Unauthorized'))
  if (isTeacherPath(path) && req.session.role !== 'teacher') {
    return next(new HttpError(403, 'Forbidden'))
  }

  next()
}
