/**
 * Lógica de dominio de profesores: gestión de grupos, asignación de misiones,
 * panel de alumnos y perfil detallado de un alumno.
 */
import { and, desc, eq, inArray } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { db } from '../../db/client.ts'
import { UNIQUE_VIOLATION, sqlStateOf } from '../../db/errors.ts'
import {
  evaluations,
  group_members,
  groups,
  mission_assignments,
  missions,
  responses,
  users,
  weekly_aggregates,
} from '../../db/schema.ts'
import { generateAccessCode } from '../../utils/access-code.ts'
import { HttpError } from '../../utils/http-error.ts'
import { getWeekStart } from '../../utils/week.ts'

export type GroupRow = typeof groups.$inferSelect
export type MissionAssignmentRow = typeof mission_assignments.$inferSelect

const MAX_ACCESS_CODE_ATTEMPTS = 10

export async function listGroups(teacherId: string): Promise<GroupRow[]> {
  return db
    .select()
    .from(groups)
    .where(eq(groups.teacher_id, teacherId))
    .orderBy(desc(groups.created_at))
}

export interface CreateGroupInput {
  name: string
  institutionName: string | null
  parentalConsentConfirmed: boolean
}

export async function createGroup(teacherId: string, input: CreateGroupInput): Promise<GroupRow> {
  // El código de acceso es único por restricción. Se reintenta ante colisión
  // en lugar de comprobar antes con un SELECT (que tendría carrera).
  for (let attempt = 0; attempt < MAX_ACCESS_CODE_ATTEMPTS; attempt++) {
    try {
      const [group] = await db
        .insert(groups)
        .values({
          id: randomUUID(),
          teacher_id: teacherId,
          name: input.name,
          access_code: generateAccessCode(),
          institution_name: input.institutionName,
          parental_consent_confirmed: true,
          created_at: new Date(),
        })
        .returning()

      if (group) return group
    } catch (err) {
      if (sqlStateOf(err) !== UNIQUE_VIOLATION) throw err
      console.warn(`[groups] colisión de access_code (intento ${attempt + 1})`)
    }
  }

  throw new HttpError(500, 'Code generation failed')
}

/** Grupo del profesor, o null si no existe o es de otro profesor. */
export async function getOwnedGroup(
  teacherId: string,
  groupId: string,
): Promise<GroupRow | null> {
  const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1)
  if (!group || group.teacher_id !== teacherId) return null
  return group
}

export async function listGroupAssignments(groupId: string) {
  const rows = await db
    .select()
    .from(mission_assignments)
    .where(eq(mission_assignments.group_id, groupId))
    .orderBy(desc(mission_assignments.created_at))

  const missionIds = [...new Set(rows.map(row => row.mission_id))]
  const missionRows = missionIds.length
    ? await db.select().from(missions).where(inArray(missions.id, missionIds))
    : []
  const missionById = new Map(missionRows.map(mission => [mission.id, mission]))

  return rows.map(assignment => ({ ...assignment, mission: missionById.get(assignment.mission_id) }))
}

export async function createAssignment(params: {
  teacherId: string
  groupId: string
  missionId: string
  dueDate: string | null
}): Promise<MissionAssignmentRow> {
  // Sin esta comprobación la asignación quedaba como un apuntador a una misión
  // inexistente y el profesor veía "Desconocida" sin poder corregirlo.
  const [mission] = await db
    .select({ id: missions.id })
    .from(missions)
    .where(eq(missions.id, params.missionId))
    .limit(1)
  if (!mission) throw new HttpError(404, 'Mission not found')

  const [assignment] = await db
    .insert(mission_assignments)
    .values({
      id: randomUUID(),
      group_id: params.groupId,
      mission_id: params.missionId,
      assigned_by: params.teacherId,
      due_date: params.dueDate,
      created_at: new Date(),
    })
    .returning()

  if (!assignment) throw new Error('El INSERT de asignación no devolvió la fila')
  return assignment
}

interface EvaluationSummary {
  id: string
  judgment: 'ADVANCE' | 'PAUSE'
  comprehensibility_score: number
  grammar_score: number
  lexical_richness_score: number
}

/**
 * Panel de alumnos del grupo: una fila por alumno con sus asignaciones y el
 * estado de cada una.
 *
 * Se resuelve con 4 consultas en total (miembros, asignaciones, alumnos,
 * misiones y respuestas+evaluaciones) en lugar de una por alumno/asignación.
 */
export async function listGroupStudents(groupId: string) {
  const [members, assignments] = await Promise.all([
    db
      .select({ student_id: group_members.student_id })
      .from(group_members)
      .where(eq(group_members.group_id, groupId)),
    db.select().from(mission_assignments).where(eq(mission_assignments.group_id, groupId)),
  ])

  const totalMissions = assignments.length
  const studentIds = [...new Set(members.map(member => member.student_id))]
  const missionIds = [...new Set(assignments.map(assignment => assignment.mission_id))]

  const [studentRows, missionRows, responseRows] = await Promise.all([
    studentIds.length
      ? db
          .select({ id: users.id, full_name: users.full_name, email: users.email })
          .from(users)
          .where(inArray(users.id, studentIds))
      : Promise.resolve([]),
    missionIds.length
      ? db.select({ id: missions.id, title: missions.title }).from(missions)
          .where(inArray(missions.id, missionIds))
      : Promise.resolve([]),
    studentIds.length
      ? db
          .select({
            id: responses.id,
            student_id: responses.student_id,
            mission_id: responses.mission_id,
            time_taken_seconds: responses.time_taken_seconds,
            submitted_at: responses.submitted_at,
            evaluation_id: evaluations.id,
            judgment: evaluations.judgment,
            comprehensibility_score: evaluations.comprehensibility_score,
            grammar_score: evaluations.grammar_score,
            lexical_richness_score: evaluations.lexical_richness_score,
          })
          .from(responses)
          .leftJoin(evaluations, eq(evaluations.response_id, responses.id))
          .where(
            and(eq(responses.group_id, groupId), inArray(responses.student_id, studentIds)),
          )
      : Promise.resolve([]),
  ])

  const studentById = new Map(studentRows.map(user => [user.id, user]))
  const missionById = new Map(missionRows.map(mission => [mission.id, mission]))

  // Respuesta más reciente por (alumno, misión) dentro del grupo.
  type ResponseRow = (typeof responseRows)[number]
  const latestByStudentMission = new Map<string, ResponseRow>()
  for (const row of responseRows) {
    const key = `${row.student_id}|${row.mission_id}`
    const current = latestByStudentMission.get(key)
    if (!current || new Date(row.submitted_at) > new Date(current.submitted_at)) {
      latestByStudentMission.set(key, row)
    }
  }

  const students = members.map(member => {
    const user = studentById.get(member.student_id)

    const enrichedAssignments = assignments.map(assignment => {
      const mission = missionById.get(assignment.mission_id)
      const latest = latestByStudentMission.get(`${member.student_id}|${assignment.mission_id}`)

      // `judgment` es NOT NULL en la tabla; el leftJoin lo hace nullable sólo
      // en el tipo, por eso el coalesce.
      const evaluation: EvaluationSummary | null =
        latest && latest.evaluation_id !== null
          ? {
              id: latest.evaluation_id,
              judgment: latest.judgment ?? 'PAUSE',
              comprehensibility_score: latest.comprehensibility_score ?? 0,
              grammar_score: latest.grammar_score ?? 0,
              lexical_richness_score: latest.lexical_richness_score ?? 0,
            }
          : null

      // Sin respuesta el estado es null (no "pending"), como antes.
      const status = latest
        ? evaluation
          ? evaluation.judgment === 'ADVANCE'
            ? 'completed'
            : 'in_progress'
          : 'in_progress'
        : null

      return {
        assignment_id: assignment.id,
        content_id: assignment.mission_id,
        type: mission ? 'mission' : 'activity',
        title: mission ? mission.title : 'Desconocida',
        due_date: assignment.due_date,
        status,
        latest_response_id: latest?.id ?? null,
        time_taken_seconds: latest?.time_taken_seconds ?? null,
        evaluation_id: evaluation?.id ?? null,
        comprehensibility_score: evaluation?.comprehensibility_score ?? null,
        grammar_score: evaluation?.grammar_score ?? null,
        lexical_richness_score: evaluation?.lexical_richness_score ?? null,
        judged: evaluation?.judgment ?? null,
        submitted_at: latest?.submitted_at ?? null,
      }
    })

    const scores = enrichedAssignments
      .map(item => item.comprehensibility_score)
      .filter((score): score is number => score !== null)

    return {
      student_id: member.student_id,
      full_name: user?.full_name ?? null,
      email: user?.email ?? '',
      missions_completed: enrichedAssignments.filter(item => item.status === 'completed').length,
      total_missions: totalMissions,
      writing_time_seconds: enrichedAssignments.reduce(
        (sum, item) => sum + (item.time_taken_seconds ?? 0),
        0,
      ),
      avg_comprehensibility: scores.length
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : null,
      assignments: enrichedAssignments,
    }
  })

  return { students, total_missions: totalMissions }
}

interface QaPair {
  prompt: string | null
  answer: string
}

/**
 * Extrae pares pregunta/respuesta del texto de una conversación.
 *
 * El texto guarda turnos con los marcadores `ASSISTANT:` y `USER:`; si no los
 * trae, las entradas cortas se tratan como respuestas del alumno.
 */
function parseQaPairs(textContent: string): QaPair[] {
  const qaPairs: QaPair[] = []
  try {
    const parts = textContent
      .split(/\n\n|\r\n\r\n|\r\n/)
      .map(part => part.trim())
      .filter(Boolean)

    let lastAssistant: string | null = null
    for (const part of parts) {
      if (/^ASSISTANT:/i.test(part)) {
        lastAssistant = part.replace(/^ASSISTANT:\s*/i, '').trim()
      } else if (/^USER:/i.test(part)) {
        qaPairs.push({
          prompt: lastAssistant,
          answer: part.replace(/^USER:\s*/i, '').trim(),
        })
        lastAssistant = null
      } else if (part.length < 400) {
        qaPairs.push({ prompt: lastAssistant, answer: part })
        lastAssistant = null
      }
    }
  } catch (err) {
    console.error('[teachers] No se pudieron extraer los pares QA:', err)
  }
  return qaPairs
}

export interface StudentProfileOptions {
  groupFilter: string | null
}

export async function getStudentProfile(
  teacherId: string,
  studentId: string,
  options: StudentProfileOptions,
) {
  const teacherGroups = await db
    .select({ id: groups.id })
    .from(groups)
    .where(eq(groups.teacher_id, teacherId))
  const teacherGroupIds = teacherGroups.map(group => group.id)

  if (teacherGroupIds.length === 0) return null

  const [membership] = await db
    .select({ id: group_members.id })
    .from(group_members)
    .where(
      and(
        eq(group_members.student_id, studentId),
        inArray(group_members.group_id, teacherGroupIds),
      ),
    )
    .limit(1)

  if (!membership) return null

  const weeks = Array.from({ length: 4 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - index * 7)
    return getWeekStart(date)
  })

  const [student, weeklyData, recentRows] = await Promise.all([
    db
      .select({
        full_name: users.full_name,
        email: users.email,
        cefr_level: users.cefr_level,
      })
      .from(users)
      .where(eq(users.id, studentId))
      .limit(1),
    db
      .select()
      .from(weekly_aggregates)
      .where(
        and(
          eq(weekly_aggregates.student_id, studentId),
          inArray(weekly_aggregates.week_start_date, weeks),
        ),
      )
      .orderBy(desc(weekly_aggregates.week_start_date)),
    (() => {
      const conditions = [
        eq(responses.student_id, studentId),
        inArray(responses.group_id, teacherGroupIds),
      ]
      if (options.groupFilter) conditions.push(eq(responses.group_id, options.groupFilter))

      return db
        .select({
          id: responses.id,
          mission_id: responses.mission_id,
          text_content: responses.text_content,
          submitted_at: responses.submitted_at,
          time_taken_seconds: responses.time_taken_seconds,
          judgment: evaluations.judgment,
          comprehensibility_score: evaluations.comprehensibility_score,
          grammar_score: evaluations.grammar_score,
          lexical_richness_score: evaluations.lexical_richness_score,
          feedback_text: evaluations.feedback_text,
          detected_structures: evaluations.detected_structures,
        })
        .from(responses)
        .leftJoin(evaluations, eq(evaluations.response_id, responses.id))
        .where(and(...conditions))
        .orderBy(desc(responses.submitted_at))
        .limit(200)
    })(),
  ])

  const studentRow = student[0]

  const totalTime = weeklyData.reduce((sum, week) => sum + week.total_writing_time_seconds, 0)
  const weeksWithScores = weeklyData.filter(week => week.avg_comprehensibility !== null)
  const avgComp = weeksWithScores.length
    ? weeksWithScores.reduce((sum, week) => sum + (week.avg_comprehensibility ?? 0), 0) /
      weeksWithScores.length
    : null

  const recentResponses = recentRows.map(row => ({
    id: row.id,
    mission_id: row.mission_id,
    text_content: row.text_content,
    submitted_at: row.submitted_at,
    time_taken_seconds: row.time_taken_seconds ?? null,
    judgment: row.judgment ?? 'PAUSE',
    comprehensibility_score: row.comprehensibility_score ?? 0,
    grammar_score: row.grammar_score ?? 0,
    lexical_richness_score: row.lexical_richness_score ?? 0,
    feedback_text: row.feedback_text ?? '',
  }))

  const frequency: Record<string, number> = {}
  for (const row of recentRows) {
    for (const structure of row.detected_structures ?? []) {
      frequency[structure] = (frequency[structure] ?? 0) + 1
    }
  }
  const topStructures = Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([structure, count]) => ({ structure, count }))

  const missionIds = [...new Set(recentResponses.map(row => row.mission_id))]
  const missionRows = missionIds.length
    ? await db.select().from(missions).where(inArray(missions.id, missionIds))
    : []
  const missionById = new Map(missionRows.map(mission => [mission.id, mission]))

  const completedMissions = recentRows
    .filter(row => row.judgment === 'ADVANCE')
    .map(row => {
      const mission = missionById.get(row.mission_id)
      const qaPairs = parseQaPairs(row.text_content)

      return {
        response_id: row.id,
        mission_id: row.mission_id,
        title: mission?.title ?? 'Misión',
        submitted_at: row.submitted_at,
        time_taken_seconds: row.time_taken_seconds ?? null,
        comprehensibility_score: row.comprehensibility_score ?? null,
        grammar_score: row.grammar_score ?? null,
        lexical_richness_score: row.lexical_richness_score ?? null,
        feedback_text: row.feedback_text ?? null,
        answers: qaPairs.map(pair => pair.answer),
        qa_pairs: qaPairs,
      }
    })

  return {
    full_name: studentRow?.full_name ?? null,
    email: studentRow?.email ?? '',
    cefr_level: studentRow?.cefr_level ?? null,
    missions_completed: completedMissions.length,
    writing_time_seconds: totalTime,
    avg_comprehensibility: avgComp,
    top_structures: topStructures,
    weekly_stats: weeklyData,
    recent_responses: recentResponses,
    completed_missions: completedMissions,
  }
}
