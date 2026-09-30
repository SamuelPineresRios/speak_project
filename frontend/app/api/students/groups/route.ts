import { NextResponse, NextRequest } from 'next/server'
import { inArray } from 'drizzle-orm'
import { readDB, type Group, type GroupMember } from '@/lib/db'
import { getDb } from '@/lib/postgres'
import { missions, users } from '@/lib/schema'
import { isAuthFailure, requireUser } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req)
    if (isAuthFailure(session)) return session
    const studentId = session.userId

    const { groups, group_members, mission_assignments, responses, evaluations } = readDB()

    // 1. Grupos del alumno en JSON; profesores y misiones en PostgreSQL.
    const memberships: Array<{ group: Group }> = group_members
      .filter((gm: GroupMember) => gm.student_id === studentId)
      .map(membership => ({ group: groups.find(g => g.id === membership.group_id) }))
      .filter((x): x is { group: Group } => x.group !== undefined)

    const teacherIds = [...new Set(memberships.map(x => x.group.teacher_id))]
    const missionIds = [...new Set(
      mission_assignments
        .filter(ma => memberships.some(x => x.group.id === ma.group_id))
        .map(ma => ma.mission_id)
    )]

    const [teacherRows, missionRows] = await Promise.all([
      teacherIds.length > 0
        ? getDb().select({ id: users.id, full_name: users.full_name })
            .from(users).where(inArray(users.id, teacherIds))
        : Promise.resolve([]),
      missionIds.length > 0
        ? getDb().select({ id: missions.id, title: missions.title })
            .from(missions).where(inArray(missions.id, missionIds))
        : Promise.resolve([]),
    ])
    const teacherById = new Map(teacherRows.map(u => [u.id, u]))
    const missionById = new Map(missionRows.map(m => [m.id, m]))

    const activeGroups = []

    for (const { group: groupInfo } of memberships) {
      const teacherInfo = teacherById.get(groupInfo.teacher_id)

      // Calculate total points for this student in this group (evaluations logic)
      // Since evaluating points per group requires filtering evaluations by assignments, we simplify for now:
      // We grab all responses from this student, join evaluations
      const studentResponses = responses.filter(r => r.student_id === studentId)
      let total_points = 0
      studentResponses.forEach(res => {
         const ev = evaluations.find(e => e.response_id === res.id)
         if (ev && ev.xp_awarded) total_points += ev.xp_awarded
      })

      // Get missions assigned to this group
      const assignments = mission_assignments.filter(ma => ma.group_id === groupInfo.id)
      const enrichedAssignments = assignments.map(a => {
        let type = 'mission'
        let title = ''

        const mission = missionById.get(a.mission_id)
        if (mission) {
            title = mission.title
            type = 'mission'
        }

        // Check if completed
        const completedRes = responses.find(r => r.student_id === studentId && r.mission_id === a.mission_id && r.status === 'completed' && r.group_id === groupInfo.id)
        const inProgressRes = responses.find(r => r.student_id === studentId && r.mission_id === a.mission_id && r.status === 'in_progress' && r.group_id === groupInfo.id)

        return {
          id: a.id,
          content_id: a.mission_id,
          type,
          title: title || 'Misión Desconocida',
          due_date: a.due_date,
          status: completedRes ? 'completed' : inProgressRes ? 'in_progress' : 'pending'
        }
      })

      activeGroups.push({
        id: groupInfo.id,
        name: groupInfo.name,
        teacher_name: teacherInfo ? teacherInfo.full_name : 'Comandante Desconocido',
        total_points,
        assignments: enrichedAssignments
      })
    }

    return NextResponse.json({ groups: activeGroups }, { status: 200 })

  } catch (error) {
    console.error('Error fetching student groups:', error)
    return NextResponse.json({ error: 'Error del servidor al recuperar escuadrones' }, { status: 500 })
  }
}
