/**
 * Cliente PostgreSQL único del proyecto (Drizzle sobre postgres.js).
 *
 * Sustituye a `lib/supabase.ts`: las tablas users/missions/guides/
 * narrative_states viven ahora en PostgreSQL en lugar de en Supabase.
 *
 * El pool se crea de forma perezosa y se cachea en `globalThis` para que los
 * recargados de Next.js en desarrollo no abran conexiones nuevas en cada
 * compilación.
 */
import postgres from 'postgres'
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

export type Db = PostgresJsDatabase<typeof schema>

const globalForDb = globalThis as unknown as { __voxDb?: Db }

export function isPostgresConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

export function getDb(): Db {
  if (globalForDb.__voxDb) return globalForDb.__voxDb

  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL no está definida. Copia frontend/.env.example a ' +
        'frontend/.env.local y rellena la conexión a PostgreSQL.',
    )
  }

  const client = postgres(url, {
    // Next.js despliega rutas bajo Node; en desarrollo se recicla el proceso.
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  })

  globalForDb.__voxDb = drizzle(client, { schema })
  return globalForDb.__voxDb
}
