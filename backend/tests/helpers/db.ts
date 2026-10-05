/**
 * Utilidades de los tests de integración.
 */
import { sql } from '../../src/db/client.ts'

/**
 * Vacía las tablas entre casos para que ningún test dependa del anterior.
 *
 * `CASCADE` arrastra las tablas que referencian a las listadas; las FK se
 * declaran en el esquema, no aquí.
 */
export async function resetDb(): Promise<void> {
  await sql`TRUNCATE TABLE
    weekly_aggregates, evaluations, responses, mission_assignments,
    group_members, narrative_states, mission_introductions, groups, missions,
    saved_words, word_lookups, users
    RESTART IDENTITY CASCADE`
}
