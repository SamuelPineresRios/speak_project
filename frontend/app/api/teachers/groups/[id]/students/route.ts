import { NextRequest, NextResponse } from 'next/server'
import { inArray } from 'drizzle-orm'
import { readDB, findById, getWeekStart } from '@/lib/db'
import { getDb } from '@/lib/postgres'
import { missions, users } from '@/lib/schema'
import { forbidden, isAuthFailure, requireTeacher } from '@/lib/session'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireTeacher(req)
  if (isAuthFailure(session)) return session
  const userId = session.userId
  const db = readDB()
  const group = findById(db.groups, params.id)
  if (!group || group.teacher_id !== userId) return forbidden()

  const weekStartDate = getWeekStart()
  const members = db.group_members.filter(m => m.group_id === params.id)
  const assignments = db.mission_assignments.filter(a => a.group_id === params.id)
  const totalMissions = assignments.length

  // Dos consultas en vez de una por miembro/asignación (evita N+1).
  const studentIds = [...new Set(members.map(m => m.student_id))]
  const missionIds = [...new Set(assignments.map(a => a.mission_id))]
  const [studentRows, missionRows] = await Promise.all([
    studentIds.length > 0
      ? getDb().select({
          id: users.id,
          full_name: users.full_name,
          email: users.email,
        }).from(users).where(inArray(users.id, studentIds))
      : Promise.resolve([]),
    missionIds.length > 0
      ? getDb().select({ id: missions.id, title: missions.title })
          .from(missions)
          .where(inArray(missions.id, missionIds))
      : Promise.resolve([]),
  ])
  const studentById = new Map(studentRows.map(u => [u.id, u]))
  const missionById = new Map(missionRows.map(m => [m.id, m]))

  const students = members.map(m => {
    const user = studentById.get(m.student_id)

    // For each assignment, find the latest response from this student for that mission within this group
    const enrichedAssignments = assignments.map(a => {
      const mission = missionById.get(a.mission_id)
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
