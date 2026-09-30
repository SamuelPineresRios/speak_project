import { NextRequest, NextResponse } from 'next/server'
import { readDB, getWeekStart } from '@/lib/db'
import { forbidden, isAuthFailure, ownsResource, requireUser } from '@/lib/session'
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireUser(req)
  if (isAuthFailure(session)) return session
  if (!ownsResource(session, params.id, ['teacher'])) return forbidden()

  const db = readDB()
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i * 7)
    return getWeekStart(d)
  })

  const weekly_stats = weeks.map(week => {
    const agg = db.weekly_aggregates.find(a => a.student_id === params.id && a.week_start_date === week)
    return {
      week_start_date: week,
      missions_completed: agg?.missions_completed ?? 0,
      writing_time_seconds: agg?.total_writing_time_seconds ?? 0,
      avg_comprehensibility: agg?.avg_comprehensibility ?? null,
    }
  })

  return NextResponse.json({ weekly_stats })
}
