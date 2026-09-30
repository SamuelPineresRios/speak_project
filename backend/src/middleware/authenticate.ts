/**
 * Resuelve la sesión a partir de la cookie.
 *
 * Nunca rechaza la petición: sólo deja `req.session` poblada o `undefined`.
 * Rechazar es responsabilidad de `apiAccessGuard` o de `requireAuth`, de modo
 * que este middleware puede aplicarse a toda la aplicación sin conocer qué
 * rutas son públicas.
 */
import type { RequestHandler } from 'express'
import { SESSION_COOKIE_NAME, verifyToken } from '../lib/auth.ts'

export const authenticate: RequestHandler = async (req, _res, next) => {
  const token: unknown = req.cookies?.[SESSION_COOKIE_NAME]
  if (typeof token === 'string' && token !== '') {
    req.session = (await verifyToken(token)) ?? undefined
  }
  next()
}
