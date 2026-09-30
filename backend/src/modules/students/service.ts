/**
 * Lógica de dominio de alumnos: grupos del alumno, unirse a un grupo y
 * agregados de escritura (semanal y de sesión).
 */
import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { db } from '../../db/client.ts'
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
import { HttpError } from '../../utils/http-error.ts'
import { getWeekStart } from '../../utils/week.ts'

/** Grupos del alumno con sus misiones asignadas y el estado de cada una. */
export async function listStudentGroups(studentId: string) {
  const memberships = await db
    .select({ group_id: group_members.group_id })
    .from(group_members)
    .where(eq(group_members.student_id, studentId))

  const groupIds = memberships.map(membership => membership.group_id)
  if (groupIds.length === 0) return { groups: [] }

  const [groupRows, assignments, responseRows, pointsRow] = await Promise.all([
    db.select().from(groups).where(inArray(groups.id, groupIds)),
    db.select().from(mission_assignments).where(inArray(mission_assignments.group_id, groupIds)),
    db
      .select({
        group_id: responses.group_id,
        mission_id: responses.mission_id,
        status: responses.status,
      })
      .from(responses)
      .where(eq(responses.student_id, studentId)),
    // total_points es el mismo para todos los grupos (no depende del grupo):
    // se calcula una sola vez.
    db
      .select({ total: sql<number>`COALESCE(SUM(${evaluations.xp_awarded}), 0)::int` })
      .from(responses)
      .innerJoin(evaluations, eq(evaluations.response_id, responses.id))
      .where(eq(responses.student_id, studentId)),
  ])

  const teacherIds = [...new Set(groupRows.map(group => group.teacher_id))]
  const missionIds = [...new Set(assignments.map(assignment => assignment.mission_id))]

  const [teacherRows, missionRows] = await Promise.all([
    teacherIds.length
      ? db
          .select({ id: users.id, full_name: users.full_name })
          .from(users)
          .where(inArray(users.id, teacherIds))
      : Promise.resolve([]),
    missionIds.length
      ? db.select({ id: missions.id, title: missions.title }).from(missions)
          .where(inArray(missions.id, missionIds))
      : Promise.resolve([]),
  ])

  const teacherById = new Map(teacherRows.map(teacher => [teacher.id, teacher]))
  const missionById = new Map(missionRows.map(mission => [mission.id, mission]))
  const totalPoints = pointsRow[0]?.total ?? 0

  const completedKeys = new Set<string>()
  const inProgressKeys = new Set<string>()
  for (const response of responseRows) {
    if (response.group_id === null) continue
    const key = `${response.group_id}|${response.mission_id}`
    if (response.status === 'completed') completedKeys.add(key)
    else if (response.status === 'in_progress') inProgressKeys.add(key)
  }

  const activeGroups = groupRows.map(group => {
    const teacher = teacherById.get(group.teacher_id)
    const groupAssignments = assignments.filter(assignment => assignment.group_id === group.id)

    const enrichedAssignments = groupAssignments.map(assignment => {
      const mission = missionById.get(assignment.mission_id)
      const key = `${group.id}|${assignment.mission_id}`

      return {
        id: assignment.id,
        content_id: assignment.mission_id,
        type: 'mission',
        title: mission?.title || 'Misión Desconocida',
        due_date: assignment.due_date,
        status: completedKeys.has(key)
          ? 'completed'
          : inProgressKeys.has(key)
            ? 'in_progress'
            : 'pending',
      }
    })

    return {
      id: group.id,
      name: group.name,
      teacher_name: teacher?.full_name ?? 'Comandante Desconocido',
      total_points: totalPoints,
      assignments: enrichedAssignments,
    }
  })

  return { groups: activeGroups }
}

export interface JoinGroupResult {
  group_id: string
  name: string
  already_member?: true
  joined?: true
}

export async function joinGroup(
  studentId: string,
  rawAccessCode: string,
): Promise<JoinGroupResult> {
  const accessCode = rawAccessCode.trim().toUpperCase()

  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.access_code, accessCode))
    .limit(1)
  if (!group) throw new HttpError(404, 'Código inválido')

  const [existing] = await db
    .select({ id: group_members.id })
    .from(group_members)
    .where(
      and(eq(group_members.group_id, group.id), eq(group_members.student_id, studentId)),
    )
    .limit(1)

  if (existing) {
    return { group_id: group.id, name: group.name, already_member: true }
  }

  // `onConflictDoNothing` cubre la carrera de dos uniones simultáneas.
  await db
    .insert(group_members)
    .values({
      id: randomUUID(),
      group_id: group.id,
      student_id: studentId,
      joined_at: new Date(),
    })
    .onConflictDoNothing({
      target: [group_members.group_id, group_members.student_id],
    })

  return { group_id: group.id, name: group.name, joined: true }
}

/** Últimas 4 semanas con los agregados del alumno (0 si no hay datos). */
export async function getWeeklyStats(studentId: string) {
  const weeks = Array.from({ length: 4 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - index * 7)
    return getWeekStart(date)
  })

  const rows = await db
    .select()
    .from(weekly_aggregates)
    .where(
      and(
        eq(weekly_aggregates.student_id, studentId),
        inArray(weekly_aggregates.week_start_date, weeks),
      ),
    )

  const byWeek = new Map(rows.map(row => [row.week_start_date, row]))

  return {
    weekly_stats: weeks.map(week => {
      const aggregate = byWeek.get(week)
      return {
        week_start_date: week,
        missions_completed: aggregate?.missions_completed ?? 0,
        writing_time_seconds: aggregate?.total_writing_time_seconds ?? 0,
        avg_comprehensibility: aggregate?.avg_comprehensibility ?? null,
      }
    }),
  }
}

function generateSuggestion(topStructures: Array<{ structure: string; count: number }>): string {
  if (topStructures.length === 0) {
    return 'Completa tu primera misión para recibir sugerencias personalizadas.'
  }

  const top = topStructures[0]
  if (!top) return 'Completa tu primera misión para recibir sugerencias personalizadas.'

  const map: Record<string, string> = {
    'present simple': `Usaste "${top.structure}" ${top.count} veces. En la próxima misión, combínalo con adverbios de frecuencia: "I usually...", "I often..."`,
    'present perfect': `¡Excelente! Usaste "${top.structure}" ${top.count} veces. Practica usarlo para experiencias: "Have you ever...?"`,
    'past simple': `Usaste "${top.structure}" con confianza. Intenta narrar secuencias: "first... then... finally..."`,
    'modal verbs': `Usaste modales ${top.count} veces. Si usaste "can", prueba "could" para sonar más formal.`,
  }

  const key = Object.keys(map).find(candidate => top.structure.toLowerCase().includes(candidate))
  const suggestion = key ? map[key] : undefined
  return (
    suggestion ??
    `Esta semana usaste "${top.structure}" ${top.count} veces. ¡Sigue practicándolo en la próxima sesión!`
  )
}

/** Resumen de la sesión: tiempo de hoy, agregado semanal y estructuras top. */
export async function getSessionSummary(studentId: string, weekOffset: number) {
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() - weekOffset * 7)
  const weekStartDate = getWeekStart(targetDate)

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [weeklyRows, todayRows, recentResponses] = await Promise.all([
    db
      .select()
      .from(weekly_aggregates)
      .where(
        and(
          eq(weekly_aggregates.student_id, studentId),
          eq(weekly_aggregates.week_start_date, weekStartDate),
        ),
      )
      .limit(1),
    db
      .select({
        total: sql<number>`COALESCE(SUM(${responses.time_taken_seconds}), 0)::int`,
      })
      .from(responses)
      .where(
        and(eq(responses.student_id, studentId), gte(responses.submitted_at, todayStart)),
      ),
    db
      .select({ id: responses.id })
      .from(responses)
      .where(eq(responses.student_id, studentId))
      .orderBy(desc(responses.submitted_at))
      .limit(20),
  ])

  const weekly = weeklyRows[0]
  const responseIds = recentResponses.map(response => response.id)

  const recentEvaluations = responseIds.length
    ? await db
        .select({ detected_structures: evaluations.detected_structures })
        .from(evaluations)
        .where(inArray(evaluations.response_id, responseIds))
    : []

  const frequency: Record<string, number> = {}
  for (const evaluation of recentEvaluations) {
    for (const structure of evaluation.detected_structures ?? []) {
      frequency[structure] = (frequency[structure] ?? 0) + 1
    }
  }

  const topStructures = Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([structure, count]) => ({ structure, count }))

  return {
    today_writing_seconds: todayRows[0]?.total ?? 0,
    week_writing_seconds: weekly?.total_writing_time_seconds ?? 0,
    missions_completed_this_week: weekly?.missions_completed ?? 0,
    avg_comprehensibility: weekly?.avg_comprehensibility ?? null,
    top_structures: topStructures,
    actionable_suggestion: generateSuggestion(topStructures),
    week_start_date: weekStartDate,
  }
}
