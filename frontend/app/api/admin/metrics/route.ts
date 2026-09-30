import { NextRequest, NextResponse } from 'next/server'
import { count, eq } from 'drizzle-orm'
import { readDB, getWeekStart } from '@/lib/db'
import { getDb } from '@/lib/postgres'
import { users } from '@/lib/schema'
import { forbidden, isAuthFailure, requireUser } from '@/lib/session'
export async function GET(req: NextRequest) {
  const session = await requireUser(req)
  if (isAuthFailure(session)) return session
  const admins = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
  if (!admins.includes(session.email)) return forbidden()

  const db = readDB()
  const weekStart = getWeekStart()
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  const roleCounts = new Map(
    (await getDb().select({ role: users.role, value: count() }).from(users).groupBy(users.role))
      .map(r => [r.role, r.value])
  )
  const totalStudents = roleCounts.get('student') ?? 0
  const totalTeachers = roleCounts.get('teacher') ?? 0

  const weeklyAggs = db.weekly_aggregates.filter(a => a.week_start_date === weekStart)
  const activeStudents = weeklyAggs.filter(a => a.missions_completed >= 3).length
  const retentionRate = totalStudents ? (activeStudents / totalStudents) * 100 : 0
  const totalWritingTime = weeklyAggs.reduce((s, a) => s + a.total_writing_time_seconds, 0)
  const avgWritingMinutes = weeklyAggs.length ? (totalWritingTime / weeklyAggs.length / 60) : 0
  const recentEvals = db.evaluations.filter(e => e.evaluated_at >= sevenDaysAgo)
  const advanceRate = recentEvals.length ? (recentEvals.filter(e => e.judgment === 'ADVANCE').length / recentEvals.length) * 100 : 0
  const avgComp = recentEvals.length ? recentEvals.reduce((s, e) => s + e.comprehensibility_score, 0) / recentEvals.length : 0

  return NextResponse.json({
    kpis: {
      retention_3_missions_7_days: { value: retentionRate.toFixed(1), unit: '%', target: 60 },
      avg_writing_minutes_per_week: { value: avgWritingMinutes.toFixed(1), unit: 'min', target: 8 },
      eval_advance_rate: { value: advanceRate.toFixed(1), unit: '%', target: 80 },
      avg_comprehensibility: { value: avgComp.toFixed(1), unit: '%' },
    },
    counts: { total_students: totalStudents, total_teachers: totalTeachers, total_responses: db.responses.length, active_students_this_week: weeklyAggs.filter(a => a.missions_completed > 0).length },
    generated_at: new Date().toISOString(),
  })
}
