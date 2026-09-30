/**
 * Cliente PostgreSQL único del backend (Drizzle sobre postgres.js).
 *
 * El pool es un singleton de módulo: el proceso vive lo que vive el servidor
 * (en desarrollo `node --watch` lo reinicia entero), así que no hace falta el
 * cacheo en `globalThis` que necesitaba Next.js.
 */
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema.ts'
import { env } from '../config/env.ts'

export const sql = postgres(env.databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

export const db = drizzle(sql, { schema })

export type Db = typeof db
