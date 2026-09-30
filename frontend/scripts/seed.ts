/**
 * Migración puntual: data/db.json -> PostgreSQL.
 *
 * Mueve las 4 tablas que hasta ahora vivían en Supabase (users, missions,
 * guides, narrative_states). El resto de colecciones siguen en db.json.
 *
 * Ya no es un "seed" del día a día: una vez ejecutada, PostgreSQL es la única
 * fuente de verdad de esas 4 tablas y db.json ya no las contiene. Para volver
 * a reconstruirlas desde cero hay que recuperar el db.json anterior desde el
 * historial de git, p. ej.:
 *
 *   git show <commit-antes-de-la-migración>:frontend/data/db.json
 *
 * Si db.json ya no tiene las colecciones, este script se detiene en lugar de
 * "completar" una migración de 0 filas.
 *
 *   node --env-file-if-exists=.env.local scripts/seed.ts
 *
 * (Node >= 22 ejecuta TypeScript sin transpilar; no añade dependencias.)
 */
import fs from 'node:fs'
import path from 'node:path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { sql, type SQL } from 'drizzle-orm'
import { guides, missions, narrative_states, users, type UserRole } from '../lib/schema.ts'

/** Convierte un ISO string a Date; devuelve null si no es parseable. */
function toDate(value?: string | null): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** `set` de un upsert: todas las columnas tomadas de `excluded`, menos la PK. */
type SqlSet<T> = { [K in keyof T]?: SQL }

function updateSet<T extends object>(row: T): SqlSet<T> {
  const set = {} as SqlSet<T>
  for (const key of Object.keys(row)) {
    if (key !== 'id') {
      ;(set as Record<string, SQL>)[key] = sql`excluded.${sql.identifier(key)}`
    }
  }
  return set
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL no definida. Configura frontend/.env.local.')
  }

  // Cliente propio en lugar de reutilizar `lib/postgres.ts`: ese módulo importa
  // `./schema` sin extensión (convención de Next/webpack) y el cargador nativo
  // de TypeScript de Node exige la extensión en las rutas relativas.
  const client = postgres(url, { max: 1 })
  const db = drizzle(client)

  const dbPath = path.join(process.cwd(), 'data', 'db.json')
  const raw = JSON.parse(fs.readFileSync(dbPath, 'utf-8')) as Record<string, any[]>

  const SOURCE_COLLECTIONS = ['users', 'missions', 'guides', 'narrative_states'] as const
  const present = SOURCE_COLLECTIONS.filter((k) => Array.isArray(raw[k]) && (raw[k] as any[]).length > 0)
  if (present.length === 0) {
    throw new Error(
      `db.json ya no contiene ${SOURCE_COLLECTIONS.join(', ')}: la migración ya se ejecutó ` +
        'y PostgreSQL es la fuente de verdad. Si necesitas reconstruir la base desde cero, ' +
        'recupera el db.json anterior con `git show <commit>:frontend/data/db.json`.'
    )
  }
  const skipped = SOURCE_COLLECTIONS.filter((k) => !present.includes(k))
  if (skipped.length) {
    console.warn(`⚠️  Colecciones ausentes en db.json: ${skipped.join(', ')}`)
  }

  const userRows = (raw.users ?? []).map((u) => ({
    id: u.id,
    email: String(u.email).toLowerCase().trim(),
    password_hash: u.password_hash,
    role: (u.role === 'teacher' ? 'teacher' : 'student') as UserRole,
    full_name: u.full_name ?? null,
    cefr_level: u.cefr_level ?? null,
    language_preference: u.language_preference ?? 'es',
    created_at: toDate(u.created_at) ?? new Date(),
  }))

  // `objetivo` es una clave errónea presente en 1 de 20 misiones; `objective`
  // (inglés) es la que consume la UI y está poblada en las 20.
  const missionRows = (raw.missions ?? []).map(({ objetivo: _objetivo, ...m }) => m)

  const guideRows = (raw.guides ?? []).map((g) => ({
    ...g,
    created_at: toDate(g.created_at),
  }))

  const stateRows = (raw.narrative_states ?? []).map((n) => ({
    ...n,
    updated_at: toDate(n.updated_at),
  }))

  if (userRows.length) {
    await db
      .insert(users)
      .values(userRows)
      .onConflictDoUpdate({ target: users.id, set: updateSet(userRows[0]) })
    console.log(`✓ users: ${userRows.length}`)
  } else {
    console.warn('⚠️  db.json no contiene usuarios; la tabla users quedará vacía.')
  }

  if (missionRows.length) {
    await db
      .insert(missions)
      .values(missionRows)
      .onConflictDoUpdate({ target: missions.id, set: updateSet(missionRows[0]) })
    console.log(`✓ missions: ${missionRows.length}`)
  }

  if (guideRows.length) {
    await db
      .insert(guides)
      .values(guideRows)
      .onConflictDoUpdate({ target: guides.id, set: updateSet(guideRows[0]) })
    console.log(`✓ guides: ${guideRows.length}`)
  }

  if (stateRows.length) {
    await db
      .insert(narrative_states)
      .values(stateRows)
      .onConflictDoUpdate({ target: narrative_states.id, set: updateSet(stateRows[0]) })
    console.log(`✓ narrative_states: ${stateRows.length}`)
  }

  await client.end()
  console.log('\nMigración completada.')
}

main().catch((err) => {
  console.error('✗ Migración fallida:', err)
  process.exit(1)
})
