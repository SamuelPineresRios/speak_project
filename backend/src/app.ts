/**
 * Composición de la aplicación Express.
 *
 * Se exporta una factoría (`createApp`) en lugar de una instancia ya
 * escuchando: los tests de integración montan la app con Supertest sin abrir
 * un puerto, y `index.ts` es el único que llama a `listen`.
 */
import express from 'express'
import cookieParser from 'cookie-parser'
import { apiAccessGuard } from './middleware/api-access-guard.ts'
import { authenticate } from './middleware/authenticate.ts'
import { errorHandler, notFoundHandler } from './middleware/error.ts'
import { securityHeaders } from './middleware/security.ts'
import { authRouter } from './modules/auth/routes.ts'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')

  app.use(securityHeaders)
  // Límite defensivo: los cuerpos legítimos (textos de misión, chat) son de
  // pocos KB. Evita que un cliente pueda agotar memoria con un body enorme.
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())

  // `authenticate` sólo resuelve la sesión; `apiAccessGuard` decide si la
  // petición puede continuar.
  app.use(authenticate)
  app.use(apiAccessGuard)

  app.get('/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/api/auth', authRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
