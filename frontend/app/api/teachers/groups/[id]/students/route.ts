import { NextRequest, NextResponse } from 'next/server'
import { readDB, findById, getWeekStart } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = readDB()
  const group = findById(db.groups, params.id)
  if (!group || group.teacher_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const weekStartDate = getWeekStart()
  const members = db.group_members.filter(m => m.group_id === params.id)
  const assignments = db.mission_assignments.filter(a => a.group_id === params.id)
  const totalMissions = assignments.length

  const students = members.map(m => {
    const user = findById(db.users, m.student_id)

    // For each assignment, find the latest response from this student for that mission within this group
    const enrichedAssignments = assignments.map(a => {
      const mission = db.missions.find((mm: any) => mm.id === a.mission_id)
      const type = mission ? 'mission' : 'activity'
      const title = mission ? mission.title : 'Desconocida'

      // Responses for this student, mission and group
      const responses = db.responses.filter((r: any) => r.student_id === m.student_id && r.mission_id === a.mission_id && r.group_id === params.id)
      // pick latest response by submitted_at
      let latestResponse = null
      if (responses.length > 0) {
        latestResponse = responses.slice().sort((x:any,y:any)=> new Date(y.submitted_at).getTime() - new Date(x.submitted_at).getTime())[0]
      }

      // Find evaluation for that response (latest)
      let evaluation = null
      if (latestResponse) {
        const evals = db.evaluations.filter((e: any) => e.response_id === latestResponse.id)
        if (evals.length > 0) evaluation = evals.slice().sort((x:any,y:any)=> new Date(y.evaluated_at).getTime() - new Date(x.evaluated_at).getTime())[0]
      }

      const status = latestResponse && (evaluation ? (evaluation.judgment === 'ADVANCE' ? 'completed' : 'in_progress') : 'in_progress')

      return {
        assignment_id: a.id,
        content_id: a.mission_id,
        type,
        title,
        due_date: a.due_date,
        status,
        latest_response_id: latestResponse?.id ?? null,
        time_taken_seconds: latestResponse?.time_taken_seconds ?? null,
        evaluation_id: evaluation?.id ?? null,
        comprehensibility_score: evaluation?.comprehensibility_score ?? null,
        grammar_score: evaluation?.grammar_score ?? null,
        lexical_richness_score: evaluation?.lexical_richness_score ?? null,
        judged: evaluation?.judgment ?? null,
        submitted_at: latestResponse?.submitted_at ?? null,
      }
    })

    const missions_completed = enrichedAssignments.filter((a:any) => a.status === 'completed').length
    const total_time = enrichedAssignments.reduce((s:any,a:any)=> s + (a.time_taken_seconds || 0), 0)
    const avg_comprehensibility = (()=>{
      const scores = enrichedAssignments.map((a:any)=>a.comprehensibility_score).filter(Boolean)
      if (scores.length===0) return null
      return Math.round(scores.reduce((s:number,x:number)=>s+x,0)/scores.length)
    })()

    return {
      student_id: m.student_id,
      full_name: user?.full_name ?? null,
      email: user?.email ?? '',
      missions_completed,
      total_missions: totalMissions,
      writing_time_seconds: total_time,
      avg_comprehensibility,
      assignments: enrichedAssignments,
    }
  })

  return NextResponse.json({ students, total_missions: totalMissions })
}
