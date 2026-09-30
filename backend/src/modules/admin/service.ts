/**
 * Métricas de administración.
 *
 * Todo se agrega en SQL: las tablas crecen con el uso (respuestas,
 * evaluaciones) y traerlas a memoria para contarlas no escala.
 */
import { count, eq, gte } from 'drizzle-orm'
import { db } from '../../db/client.ts'
import { evaluations, responses, users, weekly_aggregates } from '../../db/schema.ts'
import { getWeekStart } from '../../utils/week.ts'

export async function getAdminMetrics() {
  const weekStart = getWeekStart()
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)

  const [roleCounts, weeklyRows, recentEvaluations, responseCount] = await Promise.all([
    db.select({ role: users.role, value: count() }).from(users).groupBy(users.role),
    db
      .select()
      .from(weekly_aggregates)
      .where(eq(weekly_aggregates.week_start_date, weekStart)),
    db
      .select({
        judgment: evaluations.judgment,
        comprehensibility_score: evaluations.comprehensibility_score,
      })
      .from(evaluations)
      .where(gte(evaluations.evaluated_at, sevenDaysAgo)),
    db.select({ value: count() }).from(responses),
  ])

  const roleById = new Map(roleCounts.map(row => [row.role, row.value]))
  const totalStudents = roleById.get('student') ?? 0
  const totalTeachers = roleById.get('teacher') ?? 0

  const activeStudents = weeklyRows.filter(row => row.missions_completed >= 3).length
  const retentionRate = totalStudents ? (activeStudents / totalStudents) * 100 : 0

  const totalWritingTime = weeklyRows.reduce(
    (sum, row) => sum + row.total_writing_time_seconds,
    0,
  )
  const avgWritingMinutes = weeklyRows.length ? totalWritingTime / weeklyRows.length / 60 : 0

  const advanceRate = recentEvaluations.length
    ? (recentEvaluations.filter(row => row.judgment === 'ADVANCE').length /
        recentEvaluations.length) *
      100
    : 0

  const avgComprehensibility = recentEvaluations.length
    ? recentEvaluations.reduce((sum, row) => sum + row.comprehensibility_score, 0) /
      recentEvaluations.length
    : 0

  return {
    kpis: {
      retention_3_missions_7_days: { value: retentionRate.toFixed(1), unit: '%', target: 60 },
      avg_writing_minutes_per_week: { value: avgWritingMinutes.toFixed(1), unit: 'min', target: 8 },
      eval_advance_rate: { value: advanceRate.toFixed(1), unit: '%', target: 80 },
      avg_comprehensibility: { value: avgComprehensibility.toFixed(1), unit: '%' },
    },
    counts: {
      total_students: totalStudents,
      total_teachers: totalTeachers,
      total_responses: responseCount[0]?.value ?? 0,
      active_students_this_week: weeklyRows.filter(row => row.missions_completed > 0).length,
    },
    generated_at: new Date().toISOString(),
  }
}
