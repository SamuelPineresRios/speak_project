import { NextRequest, NextResponse } from 'next/server'
import { readDB, findById, getWeekStart } from '@/lib/db'
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id')
  const role = req.headers.get('x-user-role')
  if (!userId || role !== 'teacher') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const db = readDB()

  // Verify teacher has this student
  const teacherGroupIds = db.groups.filter(g => g.teacher_id === userId).map(g => g.id)
  const isMember = db.group_members.some(m => m.student_id === params.id && teacherGroupIds.includes(m.group_id))
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const student = findById(db.users, params.id)
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i * 7); return getWeekStart(d)
  })
  const weeklyData = db.weekly_aggregates.filter(a => a.student_id === params.id && weeks.includes(a.week_start_date))
    .sort((a, b) => b.week_start_date.localeCompare(a.week_start_date))

  const totalCompleted = weeklyData.reduce((s, w) => s + w.missions_completed, 0)
  const totalTime = weeklyData.reduce((s, w) => s + w.total_writing_time_seconds, 0)
  const withComp = weeklyData.filter(w => w.avg_comprehensibility !== null)
  const avgComp = withComp.length ? withComp.reduce((s, w) => s + (w.avg_comprehensibility ?? 0), 0) / withComp.length : null

  // Optionally filter by group (teacher UI will pass group_id when opening modal)
  const url = new URL(req.url)
  const groupFilter = url.searchParams.get('group_id')

  // Recent responses limited to those belonging to the teacher's groups and optional group filter
  const eligibleGroupIds = teacherGroupIds
  const recentResponses = db.responses
    .filter(r => r.student_id === params.id && (r.group_id === null ? false : eligibleGroupIds.includes(r.group_id)))
    .filter(r => !groupFilter || r.group_id === groupFilter)
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    .slice(0, 200)
    .map(r => {
      const ev = db.evaluations.find(e => e.response_id === r.id)
      return { id: r.id, mission_id: r.mission_id, text_content: r.text_content, submitted_at: r.submitted_at, time_taken_seconds: r.time_taken_seconds ?? null, judgment: ev?.judgment ?? 'PAUSE', comprehensibility_score: ev?.comprehensibility_score ?? 0, grammar_score: ev?.grammar_score ?? 0, lexical_richness_score: ev?.lexical_richness_score ?? 0, feedback_text: ev?.feedback_text ?? '' }
    })

  const freq: Record<string, number> = {}
  db.evaluations?.filter(e => recentResponses.some(r => r.id === e.response_id))
    .forEach(e => e.detected_structures.forEach(s => { freq[s] = (freq[s] ?? 0) + 1 }))
  const topStructures = Object.entries(freq).sort(([,a],[,b]) => b-a).slice(0,5).map(([structure,count])=>({structure,count}))

  // Build completed mission details: only include responses with evaluation.judgment === 'ADVANCE'
  const completed = recentResponses.filter(r => r.judgment === 'ADVANCE').map(r => {
    const mission = db.missions.find(m => m.id === r.mission_id)
    // Parse QA pairs from the conversation text: keep assistant prompts and user answers
    const qa_pairs: Array<{ prompt: string | null; answer: string }> = []
    try {
      const parts = r.text_content.split(/\n\n|\r\n\r\n|\r\n/).map(p => p.trim()).filter(Boolean)
      let lastAssistant: string | null = null
      for (const p of parts) {
        if (/^ASSISTANT:/i.test(p)) {
          lastAssistant = p.replace(/^ASSISTANT:\s*/i, '').trim()
        } else if (/^USER:/i.test(p)) {
          const userText = p.replace(/^USER:\s*/i, '').trim()
          qa_pairs.push({ prompt: lastAssistant, answer: userText })
          lastAssistant = null
        } else {
          // If no marker, heuristically decide: short entries likely user answers
          if (p.length < 400) {
            qa_pairs.push({ prompt: lastAssistant, answer: p })
            lastAssistant = null
          }
        }
      }
    } catch (e) { }

    // Extract plain answers from parsed QA pairs for easy display
    const answers = qa_pairs.map(p => p.answer)

    return {
      response_id: r.id,
      mission_id: r.mission_id,
      title: mission?.title ?? 'Misión',
      submitted_at: r.submitted_at,
      time_taken_seconds: r.time_taken_seconds ?? null,
      comprehensibility_score: r.comprehensibility_score ?? null,
      grammar_score: r.grammar_score ?? null,
      lexical_richness_score: r.lexical_richness_score ?? null,
      feedback_text: r.feedback_text ?? null,
      answers,
      qa_pairs
    }
  })

  return NextResponse.json({ 
      full_name: student?.full_name ?? null, 
      email: student?.email ?? '', 
      cefr_level: student?.cefr_level ?? null, 
      missions_completed: completed.length, 
      writing_time_seconds: totalTime, 
      avg_comprehensibility: avgComp, 
      top_structures: topStructures, 
      weekly_stats: weeklyData, 
      recent_responses: recentResponses, 
      completed_missions: completed
  })
}
