/**
 * Renumera las misiones a ids correlativos agrupados por nivel.
 *
 *   npm run missions:renumber -w @vox/backend
 *   npm run missions:renumber -w @vox/backend -- --dry
 *
 * Resultado: A1 -> m-001.., A2 -> m-016.., B1 -> m-031.., B2 -> m-046..
 *
 * `missions.id` es clave primaria y la referencian cuatro tablas, así que el
 * cambio se hace en dos fases (todo a ids temporales y luego a los definitivos)
 * para que una permutación no choque consigo misma.
 *
 * También remapea las cuatro tablas que referencian misiones (respuestas,
 * estados narrativos, asignaciones e introducciones), así que el progreso de
 * los alumnos sigue apuntando a la misma misión. Como las claves foráneas se
 * comprueban al momento, se retiran durante la operación y se vuelven a crear
 * al final, dentro de la misma transacción.
 */
import { sql as raw } from 'drizzle-orm'
import { db, sql } from '../src/db/client.ts'
import { missions } from '../src/db/schema.ts'
import type { CefrLevel } from '@vox/shared'

/** Orden de los niveles en la numeración. */
const LEVEL_ORDER: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']

async function countRows(table: string): Promise<number> {
  const rows = await sql.unsafe<{ count: string }[]>(`SELECT count(*)::text AS count FROM ${table}`)
  return Number(rows[0]?.count ?? 0)
}

async function main() {
  const dry = process.argv.includes('--dry')

  // 1. Qué se va a remapear (informativo).
  const childTables = ['responses', 'narrative_states', 'mission_assignments', 'mission_introductions']
  const childCounts = new Map<string, number>()
  for (const table of childTables) childCounts.set(table, await countRows(table))
  const withData = [...childCounts].filter(([, count]) => count > 0)
  console.log(
    withData.length
      ? `Datos que se remapearán: ${withData.map(([table, count]) => `${table}: ${count}`).join(', ')}`
      : 'Sin datos de alumno que remapear.',
  )

  // 2. Mapeo antiguo -> nuevo, agrupado por nivel y ordenado por id.
  const rows = await db.select({ id: missions.id, level: missions.cefr_level }).from(missions)
  const ordered = rows.sort((a, b) => {
    const byLevel = LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level)
    return byLevel !== 0 ? byLevel : a.id.localeCompare(b.id)
  })

  const mapping = ordered.map((row, index) => ({
    oldId: row.id,
    newId: `m-${String(index + 1).padStart(3, '0')}`,
    level: row.level,
  }))

  const changes = mapping.filter(entry => entry.oldId !== entry.newId)
  console.log(`${rows.length} misiones. ${changes.length} cambian de id.`)
  for (const level of LEVEL_ORDER) {
    const ids = mapping.filter(entry => entry.level === level).map(entry => entry.newId)
    if (ids.length) console.log(`  ${level}: ${ids[0]} .. ${ids[ids.length - 1]}`)
  }

  if (dry) {
    for (const entry of changes) console.log(`  ${entry.oldId} -> ${entry.newId}`)
    console.log('\nSIMULACRO: no se ha cambiado nada.')
    return
  }

  if (changes.length === 0) {
    console.log('Ya están correlativos.')
    return
  }

  /** Claves foráneas que apuntan a missions(id): tabla y nombre exacto. */
  const FOREIGN_KEYS = [
    { table: 'responses', name: 'responses_mission_id_missions_id_fk' },
    { table: 'narrative_states', name: 'narrative_states_mission_id_missions_id_fk' },
    { table: 'mission_assignments', name: 'mission_assignments_mission_id_missions_id_fk' },
    { table: 'mission_introductions', name: 'mission_introductions_mission_id_missions_id_fk' },
  ]

  await db.transaction(async tx => {
    // 3. Fuera las claves foráneas mientras se permutan los ids: se comprueban
    //    al momento y una permutación las violaría a mitad de camino.
    for (const { table, name } of FOREIGN_KEYS) {
      await tx.execute(
        raw`ALTER TABLE ${raw.raw(table)} DROP CONSTRAINT IF EXISTS ${raw.raw(name)}`,
      )
    }

    // 4. Remapear las tablas hijas.
    for (const entry of changes) {
      for (const table of childTables) {
        await tx.execute(
          raw`UPDATE ${raw.raw(table)} SET mission_id = ${entry.newId} WHERE mission_id = ${entry.oldId}`,
        )
      }
    }

    // 5. Renumerar las misiones en dos fases para no chocar consigo mismas.
    //    La segunda fase recorre el mapeo COMPLETO: las que no cambian también
    //    pasaron por el id temporal y hay que devolverlas a su sitio.
    await tx.execute(raw`UPDATE missions SET id = 'tmp-' || id`)
    for (const entry of mapping) {
      await tx.execute(
        raw`UPDATE missions SET id = ${entry.newId} WHERE id = ${'tmp-' + entry.oldId}`,
      )
    }

    // 6. Recrear las claves foráneas igual que estaban.
    for (const { table, name } of FOREIGN_KEYS) {
      await tx.execute(
        raw`ALTER TABLE ${raw.raw(table)} ADD CONSTRAINT ${raw.raw(name)} FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE`,
      )
    }
  })

  console.log(
    `\nRenumera completada. Remapeado: ${withData.map(([table, count]) => `${table}: ${count}`).join(', ') || 'nada'}.`,
  )
}

main()
  .catch(error => {
    console.error('Error renumerando:', error)
    process.exitCode = 1
  })
  .finally(() => sql.end({ timeout: 5 }))
