/**
 * Punto de entrada del backend.
 *
 *   npm run dev -w @vox/backend
 *
 * `node --watch` reinicia el proceso al cambiar un fichero y `--env-file`
 * (implícito en el script npm) carga `.env.local` sin dependencias extra.
 */
import { createApp } from './app.ts'
import { env } from './config/env.ts'

const app = createApp()

app.listen(env.port, () => {
  console.log(`[api] VOX backend escuchando en http://localhost:${env.port}`)
  if (!env.anthropicApiKey) {
    console.warn('[api] ANTHROPIC_API_KEY vacía: las rutas de IA responderán 503')
  }
})
