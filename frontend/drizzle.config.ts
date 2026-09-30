/**
 * Configuración de drizzle-kit.
 *
 * drizzle-kit no carga `.env.local` por sí solo, así que se leen aquí las
 * mismas variables que usa Next.js. La variable real del entorno siempre gana.
 *
 *   npx drizzle-kit push      # crea/actualiza las tablas sin fichero de migración
 *   npx drizzle-kit generate  # genera una migración con historial
 */
import fs from 'node:fs'
import path from 'node:path'
import type { Config } from 'drizzle-kit'

const ENV_FILES = ['.env.local', '.env']

function loadDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL

  for (const file of ENV_FILES) {
    const envPath = path.join(__dirname, file)
    if (!fs.existsSync(envPath)) continue
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq < 1) continue
      if (trimmed.slice(0, eq).trim() !== 'DATABASE_URL') continue
      return trimmed.slice(eq + 1).trim()
    }
  }

  throw new Error(
    'No se encontró DATABASE_URL. Define frontend/.env.local (ver .env.example).',
  )
}

export default {
  dialect: 'postgresql',
  schema: './lib/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: loadDatabaseUrl(),
  },
} satisfies Config
