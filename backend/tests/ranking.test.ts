/**
 * Tests del ranking de grupo.
 *
 * Lo importante: que solo lo vean los miembros (o docentes), que cada métrica
 * ordene bien y que quien no ha hecho nada aparezca con ceros al final.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { randomUUID } from 'node:crypto'
import { createApp } from '../src/app.ts'
import { db } from '../src/db/client.ts'
import { evaluations, responses } from '../src/db/schema.ts'
import { resetDb } from './helpers/db.ts'
import { createGroup, createMission, signupActor, type Actor } from './helpers/fixtures.ts'

const app = createApp()

/** Un alumno dentro del grupo (el que crea el código se une con la API). */
async function joinedStudent(groupCode: string, cefr = 'B1'): Promise<Actor> {
  const student = await signupActor(app, 'student', { cefr_level: cefr })
  const res = await student.agent.post('/api/students/join-group').send({ access_code: groupCode })
  if (res.status !== 201) throw new Error(`no se pudo unir: ${res.status} ${JSON.stringify(res.body)}`)
  return student
}

/** Respuesta evaluada con XP, misiones y tiempo conocidos. */
async function seedActivity(
  student: Actor,
  missionId: string,
  { xp, seconds, submittedAt, completed = true }: { xp: number; seconds: number; submittedAt: string; completed?: boolean },
): Promise<void> {
  const responseId = randomUUID()
  await db.insert(responses).values({
    id: responseId,
    mission_id: missionId,
    student_id: student.id,
    text_content: 'texto',
    input_mode: 'text',
    transcript: null,
    time_taken_seconds: seconds,
    submitted_at: new Date(submittedAt),
    status: completed ? 'completed' : 'in_progress',
  })
  await db.insert(evaluations).values({
    id: randomUUID(),
    response_id: responseId,
    comprehensibility_score: 80,
    grammar_score: 80,
    lexical_richness_score: 80,
    judgment: 'ADVANCE',
    feedback_text: 'texto',
    detected_structures: [],
    transcript: null,
    evaluated_at: new Date(submittedAt),
    xp_awarded: xp,
  })
}

beforeEach(async () => {
  await resetDb()
})

describe('GET /api/students/groups/:id/ranking', () => {
  it('exige sesión', async () => {
    const res = await request(app).get('/api/students/groups/g-1/ranking')
    expect(res.status).toBe(401)
  })

  it('responde 404 si el grupo no existe', async () => {
    const student = await signupActor(app, 'student')
    const res = await student.agent.get('/api/students/groups/no-existe/ranking')
    expect(res.status).toBe(404)
  })

  it('un alumno que no pertenece al grupo no puede verlo', async () => {
    const teacher = await signupActor(app, 'teacher')
    const group = await createGroup(app, teacher)
    const ajeno = await signupActor(app, 'student')

    const res = await ajeno.agent.get(`/api/students/groups/${group.id}/ranking`)
    expect(res.status).toBe(403)
  })

  it('ordena por XP y deja con ceros a quien no ha hecho nada', async () => {
    const teacher = await signupActor(app, 'teacher')
    const group = await createGroup(app, teacher)
    const ana = await joinedStudent(group.access_code)
    const luis = await joinedStudent(group.access_code)
    const sinActividad = await joinedStudent(group.access_code)
    const mission = await createMission({ cefr_level: 'B1' })
    const otra = await createMission({ cefr_level: 'B1' })

    await seedActivity(ana, mission, { xp: 120, seconds: 300, submittedAt: '2026-03-10T10:00:00Z' })
    await seedActivity(ana, otra, { xp: 80, seconds: 200, submittedAt: '2026-03-11T10:00:00Z' })
    await seedActivity(luis, mission, { xp: 300, seconds: 100, submittedAt: '2026-03-10T10:00:00Z' })

    // Lo ve un miembro del grupo
    const res = await ana.agent.get(`/api/students/groups/${group.id}/ranking`)

    expect(res.status).toBe(200)
    expect(res.body.metric).toBe('xp')

    const entries = res.body.entries as Array<{ student_id: string; xp: number; missions: number; seconds: number; position: number }>
    expect(entries[0]?.student_id).toBe(luis.id)
    expect(entries[0]?.xp).toBe(300)
    expect(entries[1]?.student_id).toBe(ana.id)
    expect(entries[1]?.xp).toBe(200)
    expect(entries[1]?.missions).toBe(2)
    expect(entries[1]?.seconds).toBe(500)
    expect(entries[2]?.student_id).toBe(sinActividad.id)
    expect(entries[2]?.xp).toBe(0)
    expect(entries.map(entry => entry.position)).toEqual([1, 2, 3])
  })

  it('ordena por misiones y por tiempo cuando se pide', async () => {
    const teacher = await signupActor(app, 'teacher')
    const group = await createGroup(app, teacher)
    const ana = await joinedStudent(group.access_code)
    const luis = await joinedStudent(group.access_code)
    const mission = await createMission({ cefr_level: 'B1' })
    const otra = await createMission({ cefr_level: 'B1' })

    // Ana: más misiones y más tiempo; Luis: más XP con una sola misión.
    await seedActivity(ana, mission, { xp: 60, seconds: 400, submittedAt: '2026-03-10T10:00:00Z' })
    await seedActivity(ana, otra, { xp: 60, seconds: 300, submittedAt: '2026-03-11T10:00:00Z' })
    await seedActivity(luis, mission, { xp: 500, seconds: 50, submittedAt: '2026-03-10T10:00:00Z' })

    const porMisiones = await ana.agent.get(`/api/students/groups/${group.id}/ranking?metric=missions`)
    expect(porMisiones.body.entries[0]?.student_id).toBe(ana.id)
    expect(porMisiones.body.entries[0]?.missions).toBe(2)

    const porTiempo = await ana.agent.get(`/api/students/groups/${group.id}/ranking?metric=time`)
    expect(porTiempo.body.entries[0]?.student_id).toBe(ana.id)
    expect(porTiempo.body.entries[0]?.seconds).toBe(700)

    // Una métrica desconocida cae en XP.
    const desconocida = await ana.agent.get(`/api/students/groups/${group.id}/ranking?metric=loquesea`)
    expect(desconocida.body.metric).toBe('xp')
    expect(desconocida.body.entries[0]?.student_id).toBe(luis.id)
  })

  it('no mezcla alumnos de otros grupos y el docente puede verlo', async () => {
    const teacher = await signupActor(app, 'teacher')
    const group = await createGroup(app, teacher)
    const otroGrupo = await createGroup(app, teacher, 'Otro grupo')
    const dentro = await joinedStudent(group.access_code)
    const fuera = await joinedStudent(otroGrupo.access_code)
    const mission = await createMission({ cefr_level: 'B1' })

    await seedActivity(dentro, mission, { xp: 100, seconds: 100, submittedAt: '2026-03-10T10:00:00Z' })
    await seedActivity(fuera, mission, { xp: 900, seconds: 900, submittedAt: '2026-03-10T10:00:00Z' })

    const comoAlumno = await dentro.agent.get(`/api/students/groups/${group.id}/ranking`)
    expect(comoAlumno.body.entries).toHaveLength(1)
    expect(comoAlumno.body.entries[0]?.student_id).toBe(dentro.id)

    const comoDocente = await teacher.agent.get(`/api/students/groups/${group.id}/ranking`)
    expect(comoDocente.status).toBe(200)
    expect(comoDocente.body.entries).toHaveLength(1)
  })
})
