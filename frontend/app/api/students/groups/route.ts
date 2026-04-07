import { NextResponse, NextRequest } from 'next/server'
import { readDB } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const studentId = req.headers.get('x-user-id')
    if (!studentId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { groups, group_members, mission_assignments, users, missions, responses, evaluations } = readDB()

    // 1. Get groups for this student
    const studentMemberships = group_members.filter((gm: any) => gm.student_id === studentId)
    const activeGroups = []

    for (const membership of studentMemberships) {
      const groupInfo = groups.find((g: any) => g.id === membership.group_id)
      if (!groupInfo) continue;

      const teacherInfo = users.find((u: any) => u.id === groupInfo.teacher_id)
      
      // Calculate total points for this student in this group (evaluations logic)
      // Since evaluating points per group requires filtering evaluations by assignments, we simplify for now:
      // We grab all responses from this student, join evaluations
      const studentResponses = responses.filter((r: any) => r.student_id === studentId)
      let total_points = 0
      studentResponses.forEach((res: any) => {
         const ev = evaluations.find((e: any) => e.response_id === res.id)
         if (ev && ev.xp_awarded) total_points += ev.xp_awarded
      })

      // Get missions assigned to this group
      const assignments = mission_assignments.filter((ma: any) => ma.group_id === groupInfo.id)
      const enrichedAssignments = assignments.map((a: any) => {
        // Find if mission or story
        let typedAssignment = null
        let type = 'mission'
        let title = ''

        const mission = missions.find((m: any) => m.id === a.mission_id)
        if (mission) {
            title = mission.title
            type = 'mission'
        }

        // Check if completed
        const completedRes = responses.find((r: any) => r.student_id === studentId && r.mission_id === a.mission_id && r.status === 'completed' && r.group_id === groupInfo.id)
        const inProgressRes = responses.find((r: any) => r.student_id === studentId && r.mission_id === a.mission_id && r.status === 'in_progress' && r.group_id === groupInfo.id)

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
