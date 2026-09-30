/**
 * Sesión adjunta a `req` por el middleware `authenticate`.
 *
 * Es opcional a propósito: sólo `requireAuth` / `requireTeacher` garantizan su
 * presencia. Los handlers de rutas protegidas la leen con `sessionOf(req)`.
 */
import type { SessionPayload } from '@vox/shared'

declare global {
  namespace Express {
    interface Request {
      session?: SessionPayload
    }
  }
}

export {}
