import { NextRequest, NextResponse } from 'next/server'
import { readDB, getWeekStart } from '@/lib/db'
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id')
  const role = req.headers.get('x-user-role')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (userId !== params.id && role !== 'teacher') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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
