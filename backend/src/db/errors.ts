/**
 * Lectura de errores de PostgreSQL.
 *
 * Drizzle envuelve los errores del driver (`DrizzleQueryError`), así que el
 * `code` SQLSTATE no siempre está en la raíz: hay que mirar también `cause`.
 * Centralizarlo aquí evita que cada módulo invente su propia introspección y
 * que una violación de unicidad acabe devolviendo un 500.
 */

/** SQLSTATE de violación de restricción única o de primary key. */
export const UNIQUE_VIOLATION = '23505'

/** SQLSTATE de violación de clave foránea. */
export const FOREIGN_KEY_VIOLATION = '23503'

function readCode(err: unknown): string | undefined {
  if (!err || typeof err !== 'object') return undefined

  const direct = (err as { code?: unknown }).code
  if (typeof direct === 'string') return direct

  const cause = (err as { cause?: unknown }).cause
  if (cause && typeof cause === 'object') {
    const nested = (cause as { code?: unknown }).code
    if (typeof nested === 'string') return nested
  }

  return undefined
}

/** SQLSTATE del error, buscando en la causa cuando Drizzle lo envuelve. */
export function sqlStateOf(err: unknown): string | undefined {
  return readCode(err)
}
