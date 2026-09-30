/**
 * Tests de integración de guías: listado, filtros, detalle, ejercicios y
 * marcado de completado.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.ts'
import { sql } from '../src/db/client.ts'
import { resetDb } from './helpers/db.ts'
import { createGuide, signupActor } from './helpers/fixtures.ts'

const app = createApp()

beforeEach(async () => {
  await resetDb()
})

describe('GET /api/guides', () => {
  it('responde 401 sin sesión', async () => {
    const res = await request(app).get('/api/guides')

    expect(res.status).toBe(401)
  })

  it('devuelve todas las guías', async () => {
    const student = await signupActor(app, 'student')
    await createGuide({ id: 'g-1', concept_tags: ['present-simple'] })
    await createGuide({ id: 'g-2', concept_tags: ['past-simple'] })

    const res = await student.agent.get('/api/guides')

    expect(res.status).toBe(200)
    expect(res.body.guides).toHaveLength(2)
  })

  it('filtra por nivel CEFR', async () => {
    const student = await signupActor(app, 'student')
    await createGuide({ id: 'g-1', cefr_level: 'A2' })
    await createGuide({ id: 'g-2', cefr_level: 'B1' })

    const res = await student.agent.get('/api/guides?cefr_level=A2')

    expect(res.body.guides).toHaveLength(1)
    expect(res.body.guides[0].id).toBe('g-1')
  })

  it('filtra por concept_tag dentro del jsonb', async () => {
    const student = await signupActor(app, 'student')
    await createGuide({ id: 'g-1', concept_tags: ['present-simple'] })
    await createGuide({ id: 'g-2', concept_tags: ['past-simple'] })

    const res = await student.agent.get('/api/guides?concept_tag=past-simple')

    expect(res.body.guides).toHaveLength(1)
    expect(res.body.guides[0].id).toBe('g-2')
  })

  it('devuelve una lista vacía si el filtro no casa con nada', async () => {
    const student = await signupActor(app, 'student')
    await createGuide({ id: 'g-1' })

    const res = await student.agent.get('/api/guides?cefr_level=X9')

    expect(res.status).toBe(200)
    expect(res.body.guides).toEqual([])
  })
})

describe('GET /api/guides/:id', () => {
  it('devuelve la guía con su contenido jsonb completo', async () => {
    const student = await signupActor(app, 'student')
    const guideId = await createGuide({ id: 'g-full' })

    const res = await student.agent.get(`/api/guides/${guideId}`)

    expect(res.status).toBe(200)
    expect(res.body.guide.content.exercises).toHaveLength(2)
  })

  it('responde 404 si no existe', async () => {
    const student = await signupActor(app, 'student')

    const res = await student.agent.get('/api/guides/no-existe')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Guide not found' })
  })
})

describe('POST /api/guides/:id/mark-completed', () => {
  it('crea el progreso usando el número de ejercicios de la guía', async () => {
    const student = await signupActor(app, 'student')
    const guideId = await createGuide({ id: 'g-1' })

    const res = await student.agent.post(`/api/guides/${guideId}/mark-completed`).send({})

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.progress.status).toBe('completed')
    expect(res.body.progress.exercises_total).toBe(2)
    expect(res.body.progress.exercises_completed).toBe(2)
    expect(res.body.progress.score).toBe(100)
  })

  it('es idempotente: repetir no duplica el progreso', async () => {
    const student = await signupActor(app, 'student')
    const guideId = await createGuide({ id: 'g-1' })

    await student.agent.post(`/api/guides/${guideId}/mark-completed`).send({ score: 80 })
    const second = await student.agent.post(`/api/guides/${guideId}/mark-completed`).send({ score: 90 })

    expect(second.body.progress.score).toBe(90)

    const [row] = await sql<{ count: number }[]>`
      SELECT count(*)::int AS count FROM guide_progress
    `
    expect(row?.count).toBe(1)
  })

  it('responde 404 si la guía no existe', async () => {
    const student = await signupActor(app, 'student')

    const res = await student.agent.post('/api/guides/no-existe/mark-completed').send({})

    expect(res.status).toBe(404)
  })
})

describe('POST /api/guides/:id/exercise-submission', () => {
  it('registra la respuesta y devuelve la fila creada', async () => {
    const student = await signupActor(app, 'student')
    const guideId = await createGuide({ id: 'g-1' })

    const res = await student.agent
      .post(`/api/guides/${guideId}/exercise-submission`)
      .send({ exercise_id: 'ex-1', selected_answer: 'am', is_correct: true })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.submission.exercise_id).toBe('ex-1')
    expect(res.body.submission.selected_answer).toBe('am')
    expect(res.body.submission.is_correct).toBe(true)
  })

  it('exige exercise_id y selected_answer', async () => {
    const student = await signupActor(app, 'student')
    const guideId = await createGuide({ id: 'g-1' })

    const res = await student.agent
      .post(`/api/guides/${guideId}/exercise-submission`)
      .send({ exercise_id: 'ex-1' })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Missing exercise_id or selected_answer' })
  })

  it('responde 404 si la guía no existe (en vez de 500 por FK)', async () => {
    const student = await signupActor(app, 'student')

    const res = await student.agent
      .post('/api/guides/no-existe/exercise-submission')
      .send({ exercise_id: 'ex-1', selected_answer: 'am', is_correct: true })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Guide not found' })
  })
})

describe('GET /api/guides/:id/chat', () => {
  it('devuelve el historial vacío al empezar', async () => {
    const student = await signupActor(app, 'student')
    const guideId = await createGuide({ id: 'g-1' })

    const res = await student.agent.get(`/api/guides/${guideId}/chat`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true, messages: [] })
  })
})
