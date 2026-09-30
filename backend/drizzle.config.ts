/**
 * Configuración de Drizzle Kit (push del esquema y futuras migraciones).
 *
 * Carga `backend/.env.local` si existe (Node ≥ 20.12); si no, usa el entorno
 * tal cual, de modo que en CI o en tests basta con exportar DATABASE_URL.
 */
import { defineConfig } from 'drizzle-kit'

try {
  process.loadEnvFile('.env.local')
} catch {
  // Sin .env.local: se usa el entorno tal cual.
}

const url = process.env.DATABASE_URL
if (!url) {
  throw new Error(
    'DATABASE_URL no está definida. Copia backend/.env.example a backend/.env.local.',
  )
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url },
})
