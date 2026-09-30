/**
 * Cierre del pool al terminar cada fichero de test.
 *
 * Sin esto Vitest queda esperando a que la conexión de postgres.js se libere.
 */
import { afterAll } from 'vitest'
import { sql } from '../src/db/client.ts'

afterAll(async () => {
  await sql.end({ timeout: 5 })
})
