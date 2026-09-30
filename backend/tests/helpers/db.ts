/**
 * Utilidades de los tests de integración.
 */
import { sql } from '../../src/db/client.ts'

/**
 * Vacía las tablas entre casos para que ningún test dependa del anterior.
 *
 * `CASCADE` arrastra las tablas que referencian a `users` aunque no se listen
 * explícitamente; las FK se declaran en el esquema, no aquí.
 */
export async function resetDb(): Promise<void> {
  await sql`TRUNCATE TABLE narrative_states, guides, missions, users RESTART IDENTITY CASCADE`
}
