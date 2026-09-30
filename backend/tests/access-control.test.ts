/**
 * Matriz de control de acceso (IDOR / roles / aislamiento entre profesores).
 *
 * Es el test más importante de la migración: los guards se reescribieron por
 * completo y un fallo aquí expone datos de otros usuarios.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.ts'
import { sql } from '../src/db/client.ts'
import { resetDb } from './helpers/db.ts'
import { createGroup, createMission, signupActor } from './helpers/fixtures.ts'

const app = createApp()

beforeEach(async () => {
  await resetDb()
})

describe('sin sesión', () => {
  it.each([
    ['get', '/api/missions'],
    ['get', '/api/guides'],
    ['get', '/api/responses/x'],
    ['get', '/api/evaluations/x'],
    ['get', '/api/students/x/weekly-stats'],
    ['get', '/api/students/x/session-summary'],
    ['get', '/api/teachers/groups'],
    ['get', '/api/admin/metrics'],
  ])('%s %s responde 401', async (method, path) => {
    const res = await request(app)[method as 'get'](path)

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Unauthorized' })
  })

  it('POST /api/chat responde 401', async () => {
    const res = await request(app).post('/api/chat').send({ messages: [], mission: {} })

    expect(res.status).toBe(401)
  })
})

describe('rol student en rutas de profesor', () => {
  it('responde 403 en cualquier /api/teachers/*', async () => {
    const student = await signupActor(app, 'student')

    const res = await student.agent.get('/api/teachers/groups')

    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: 'Forbidden' })
  })
})

describe('propiedad de respuestas y evaluaciones', () => {
  it('un alumno no puede leer la respuesta ni la evaluación de otro', async () => {
    const missionId = await createMission({ cefr_level: 'A1' })
    const studentA = await signupActor(app, 'student', { cefr_level: 'A1' })
    const studentB = await signupActor(app, 'student', { cefr_level: 'A1' })

    const submitted = await studentA.agent
      .post(`/api/missions/${missionId}/submit`)
      .send({ response_text: 'My name is Ana and I am from Peru.' })

    const responseId = submitted.body.response_id as string
    const evaluationId = submitted.body.evaluation_id as string

    const ownResponse = await studentA.agent.get(`/api/responses/${responseId}`)
    const ownEvaluation = await studentA.agent.get(`/api/evaluations/${evaluationId}`)
    const otherResponse = await studentB.agent.get(`/api/responses/${responseId}`)
    const otherEvaluation = await studentB.agent.get(`/api/evaluations/${evaluationId}`)

    expect(ownResponse.status).toBe(200)
    expect(ownEvaluation.status).toBe(200)
    expect(otherResponse.status).toBe(403)
    expect(otherEvaluation.status).toBe(403)
  })

  it('un profesor puede leer respuestas y evaluaciones (rol docente)', async () => {
    const missionId = await createMission({ cefr_level: 'A1' })
    const student = await signupActor(app, 'student', { cefr_level: 'A1' })
    const teacher = await signupActor(app, 'teacher')

    const submitted = await student.agent
      .post(`/api/missions/${missionId}/submit`)
      .send({ response_text: 'My name is Ana and I am from Peru.' })

    const response = await teacher.agent.get(`/api/responses/${submitted.body.response_id}`)
    const evaluation = await teacher.agent.get(`/api/evaluations/${submitted.body.evaluation_id}`)

    expect(response.status).toBe(200)
    expect(evaluation.status).toBe(200)
  })

  it('un alumno no puede leer las estadísticas de otro', async () => {
    const studentA = await signupActor(app, 'student')
    const studentB = await signupActor(app, 'student')

    const stats = await studentB.agent.get(`/api/students/${studentA.id}/weekly-stats`)
    const summary = await studentB.agent.get(`/api/students/${studentA.id}/session-summary`)

    expect(stats.status).toBe(403)
    expect(summary.status).toBe(403)
  })
})

describe('aislamiento entre profesores', () => {
  it('un profesor no puede ver ni tocar los grupos de otro', async () => {
    const teacherA = await signupActor(app, 'teacher')
    const teacherB = await signupActor(app, 'teacher')
    const student = await signupActor(app, 'student')
    const group = await createGroup(app, teacherA)
    const missionId = await createMission()

    await student.agent.post('/api/students/join-group').send({ access_code: group.access_code })

    const detail = await teacherB.agent.get(`/api/teachers/groups/${group.id}`)
    const students = await teacherB.agent.get(`/api/teachers/groups/${group.id}/students`)
    const assignments = await teacherB.agent.get(`/api/teachers/groups/${group.id}/assign-mission`)
    const assign = await teacherB.agent
      .post(`/api/teachers/groups/${group.id}/assign-mission`)
      .send({ mission_id: missionId })
    const profile = await teacherB.agent.get(`/api/teachers/students/${student.id}/profile`)

    expect(detail.status).toBe(404)
    expect(students.status).toBe(403)
    expect(assignments.status).toBe(403)
    expect(assign.status).toBe(403)
    expect(profile.status).toBe(403)
  })
})

describe('grupo ajeno en el envío de misión', () => {
  it('ignora un group_id del que el alumno no es miembro', async () => {
    const teacher = await signupActor(app, 'teacher')
    const intruder = await signupActor(app, 'student', { cefr_level: 'A1' })
    const group = await createGroup(app, teacher)
    const missionId = await createMission({ cefr_level: 'A1' })

    const res = await intruder.agent
      .post(`/api/missions/${missionId}/submit`)
      .send({ response_text: 'My name is Ana and I am from Peru.', group_id: group.id })

    expect(res.status).toBe(200)

    const [row] = await sql<{ group_id: string | null }[]>`
      SELECT group_id FROM responses WHERE id = ${res.body.response_id}
    `
    expect(row?.group_id).toBeNull()
  })
})

describe('métricas de administración', () => {
  it('responde 403 a un profesor que no está en ADMIN_EMAILS', async () => {
    const teacher = await signupActor(app, 'teacher')

    const res = await teacher.agent.get('/api/admin/metrics')

    expect(res.status).toBe(403)
  })

  it('responde 200 al email de ADMIN_EMAILS', async () => {
    const admin = await signupActor(app, 'teacher', { email: 'admin@vox.test' })

    const res = await admin.agent.get('/api/admin/metrics')

    expect(res.status).toBe(200)
    expect(res.body.counts.total_teachers).toBeGreaterThanOrEqual(1)
    expect(res.body.kpis).toHaveProperty('retention_3_missions_7_days')
    expect(res.body.generated_at).toEqual(expect.any(String))
  })
})

describe('guard global de la API', () => {
  it('corta con 401 antes de llegar a una ruta inexistente', async () => {
    const res = await request(app).get('/api/no-existe')

    expect(res.status).toBe(401)
  })

  it('devuelve 404 con sesión en una ruta inexistente', async () => {
    const student = await signupActor(app, 'student')

    const res = await student.agent.get('/api/no-existe')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Not found' })
  })
})
