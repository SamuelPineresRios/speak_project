import { NextRequest, NextResponse } from 'next/server'
import { findById, readDB, writeDB, getWeekStart } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId || userId !== params.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { full_name } = await req.json()
  if (!full_name || typeof full_name !== 'string') return NextResponse.json({ error: 'Invalid name' }, { status: 400 })

  const db = readDB()
  const studentIndex = db.users.findIndex(u => u.id === params.id)
  if (studentIndex === -1) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  db.users[studentIndex].full_name = full_name
  writeDB(db)

  return NextResponse.json({ success: true, full_name })
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id')
  const role = req.headers.get('x-user-role')

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (userId !== params.id && role !== 'teacher') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = readDB()
  const student = findById(db.users, params.id)
  if (!student) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Try to get narrative_states from Supabase first
  let completedMissionsFromSupabase: any[] = []
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data } = await supabase
        .from('narrative_states')
        .select('*')
        .eq('student_id', params.id)
        .eq('state', 'completed')
      
      if (data) {
        completedMissionsFromSupabase = data
        console.log('[Profile] Loaded', data.length, 'completed missions from Supabase')
      }
    } catch (e) {
      console.log('[Profile] Could not load from Supabase, using local DB only')
    }
  }

  // Fallback to local DB narrative_states
  const completedMissionsLocal = db.narrative_states
    .filter(n => n.student_id === params.id && n.state === 'completed')
  
  // Prefer Supabase data if available, otherwise use local
  const completedMissions = completedMissionsFromSupabase.length > 0 
    ? completedMissionsFromSupabase 
    : completedMissionsLocal

  const weeklyData = db.weekly_aggregates
    .filter(a => a.student_id === params.id)
    .sort((a, b) => b.week_start_date.localeCompare(a.week_start_date))

  const missionsCompleted = Math.max(
    completedMissions.length, // Use count from narrative_states
    weeklyData.reduce((sum, w) => sum + w.missions_completed, 0) // Or from weekly aggregates
  )
  const writingTimeSeconds = weeklyData.reduce((sum, w) => sum + w.total_writing_time_seconds, 0)
  const withComp = weeklyData.filter(w => w.avg_comprehensibility !== null)
  const avgComprehensibility = withComp.length
    ? withComp.reduce((sum, w) => sum + (w.avg_comprehensibility ?? 0), 0) / withComp.length
    : null

  const recentResponses = db.responses
    .filter(r => r.student_id === params.id)
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    .slice(0, 30)

  const recentResponseIds = recentResponses.map(r => r.id)
  const freq: Record<string, number> = {}

  db.evaluations
    .filter(e => recentResponseIds.includes(e.response_id))
    .forEach(e => {
      e.detected_structures.forEach(s => {
        freq[s] = (freq[s] ?? 0) + 1
      })
    })

  const topStructures = Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([structure, count]) => ({ structure, count }))

  const weeks = Array.from({ length: 4 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    return getWeekStart(d)
  })

  const weeklyStats = weeks.map(week => {
    const agg = db.weekly_aggregates.find(a => a.student_id === params.id && a.week_start_date === week)
    return {
      week_start_date: week,
      missions_completed: agg?.missions_completed ?? 0,
      writing_time_seconds: agg?.total_writing_time_seconds ?? 0,
      avg_comprehensibility: agg?.avg_comprehensibility ?? null,
    }
  })

  const guidesCompleted = (db.guide_progress || [])
    .filter(gp => gp.student_id === params.id && gp.status === 'completed')
    .length

  return NextResponse.json({
    full_name: student.full_name ?? null,
    email: student.email,
    cefr_level: student.cefr_level ?? null,
    missions_completed: missionsCompleted,
    writing_time_seconds: writingTimeSeconds,
    avg_comprehensibility: avgComprehensibility,
    top_structures: topStructures,
    weekly_stats: weeklyStats,
    guides_completed: guidesCompleted,
  })
}
