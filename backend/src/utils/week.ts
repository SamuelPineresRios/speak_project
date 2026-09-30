/**
 * Semana ISO del motor de agregados.
 *
 * Devuelve el lunes de la semana de `date` en formato `YYYY-MM-DD`, que es el
 * valor que guarda `weekly_aggregates.week_start_date`.
 *
 * Nota: se calcula sobre la fecha local y se serializa en UTC (mismo
 * comportamiento que el `getWeekStart` original); cambiarlo alteraría las
 * claves de las semanas ya almacenadas.
 */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}
