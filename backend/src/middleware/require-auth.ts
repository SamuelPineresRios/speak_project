/**
 * Autorización por ruta (defensa en profundidad).
 *
 * `apiAccessGuard` ya cierra toda `/api/*`, pero cada router vuelve a exigir la
 * sesión que necesita: un cambio futuro en el guard no puede convertirse por sí
 * solo en un IDOR.
 */
import type { Request, RequestHandler } from 'express'
import type { SessionPayload } from '@vox/shared'
import { HttpError } from '../utils/http-error.ts'

export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.session) return next(new HttpError(401, 'Unauthorized'))
  next()
}

export const requireTeacher: RequestHandler = (req, _res, next) => {
  if (!req.session) return next(new HttpError(401, 'Unauthorized'))
  if (req.session.role !== 'teacher') return next(new HttpError(403, 'Forbidden'))
  next()
}

/**
 * Sesión garantizada por `requireAuth` / `requireTeacher`.
 *
 * Si `req.session` no existe aquí es un error de programación (la ruta se
 * registró sin guard), no una petición no autorizada.
 */
export function sessionOf(req: Request): SessionPayload {
  if (!req.session) throw new HttpError(500, 'Error interno')
  return req.session
}
