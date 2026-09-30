/**
 * Cabeceras de seguridad de la API.
 *
 * Replica lo que `next.config.js` aplicaba a `/api/:path*`. Se limitan a la
 * API porque el frontend lo sirve otro proceso (Vite en desarrollo, el
 * hosting estático en producción); sus cabeceras se configuran allí.
 */
import type { RequestHandler } from 'express'

export const securityHeaders: RequestHandler = (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
  }
  next()
}
