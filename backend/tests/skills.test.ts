/**
 * Tests del perfil de habilidades del alumno.
 *
 * Las métricas salen de las evaluaciones reales, así que aquí se mockea la IA
 * con notas conocidas y se comprueba la aritmética exacta.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

vi.mock('../src/lib/ai.ts', () => {
  class AIProviderError extends Error {
    readonly status: number
    readonly detail: string | undefined
    constructor(message: string, status: number, detail?: string) {
      super(message)
      this.name = 'AIProviderError'
      this.status = status
      this.detail = detail
    }
  }
  return {
    DEFAULT_AI_MODEL: 'test-model',
    AIProviderError,
    requireAnthropicKey: vi.fn(() => 'test-key'),
    completeChat: vi.fn(),
  }
})

import { completeChat } from '../src/lib/ai.ts'
import { createApp } from '../src/app.ts'
import { resetDb } from './helpers/db.ts'
import { createMission, signupActor } from './helpers/fixtures.ts'

const app = createApp()
const mockedCompleteChat = vi.mocked(completeChat)

/** Evaluación con notas conocidas para poder verificar las medias. */
function evaluationWith(grammar: number, lexical: number, comprehensibility: number) {
  return JSON.stringify({
    comprehensibility_score: comprehensibility,
    grammar_score: grammar,
    lexical_richness_score: lexical,
    judgment: 'ADVANCE',
    feedback_text: 'Bien.',
    detected_structures: ['present-simple'],
  })
}

beforeEach(async () => {
  await resetDb()
  mockedCompleteChat.mockReset()
})

describe('GET /api/students/:id/skills', () => {
  it('responde 401 sin sesión', async () => {
    const res = await request(app).get('/api/students/x/skills')

    expect(res.status).toBe(401)
  })

  it('responde 403 si el alumno es otro', async () => {
    const student = await signupActor(app, 'student')
    const other = await signupActor(app, 'student')

    const res = await other.agent.get(`/api/students/${student.id}/skills`)

    expect(res.status).toBe(403)
  })

  it('sin misiones evaluadas devuelve ceros y nulos, no inventa notas', async () => {
    const student = await signupActor(app, 'student')

    const res = await student.agent.get(`/api/students/${student.id}/skills`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      evaluated_responses: 0,
      grammar: null,
      vocabulary: null,
      comprehension: null,
      writing: null,
      speed: null,
      top_structures: [],
    })
  })

  it('calcula las medias desde las evaluaciones reales', async () => {
    const student = await signupActor(app, 'student', { cefr_level: 'A1' })
    const missionA = await createMission({ id: 'm-a', cefr_level: 'A1', base_duration_seconds: 120 })
    const missionB = await createMission({ id: 'm-b', cefr_level: 'A1', base_duration_seconds: 120 })

    // Respuesta 1: 90 / 80 / 70 con 60s (misión de 120s -> velocidad tope 100)
    mockedCompleteChat.mockResolvedValueOnce(evaluationWith(90, 80, 70))
    await student.agent
      .post(`/api/missions/${missionA}/submit`)
      .send({ response_text: 'My name is Ana and I am from Peru.', time_taken_seconds: 60 })

    // Respuesta 2: 70 / 60 / 50 con 240s (misión de 120s -> velocidad 50)
    mockedCompleteChat.mockResolvedValueOnce(evaluationWith(70, 60, 50))
    await student.agent
      .post(`/api/missions/${missionB}/submit`)
      .send({ response_text: 'I live in Lima and I study English.', time_taken_seconds: 240 })

    const res = await student.agent.get(`/api/students/${student.id}/skills`)

    expect(res.status).toBe(200)
    expect(res.body.evaluated_responses).toBe(2)
    // Medias de (90,70), (80,60), (70,50)
    expect(res.body.grammar).toBe(80)
    expect(res.body.vocabulary).toBe(70)
    expect(res.body.comprehension).toBe(60)
    // Media de las tres notas por respuesta: (80 + 70 + 60) / 3 = 70
    expect(res.body.writing).toBe(70)
    // Velocidades: 100 y 50
    expect(res.body.speed).toBe(75)
    expect(res.body.top_structures).toEqual([{ structure: 'present-simple', count: 2 }])
  })

  it('no cuenta la velocidad de las respuestas sin tiempo registrado', async () => {
    const student = await signupActor(app, 'student', { cefr_level: 'A1' })
    const missionId = await createMission({ id: 'm-a', cefr_level: 'A1', base_duration_seconds: 120 })

    mockedCompleteChat.mockResolvedValue(evaluationWith(80, 80, 80))
    await student.agent
      .post(`/api/missions/${missionId}/submit`)
      .send({ response_text: 'My name is Ana and I am from Peru.' })

    const res = await student.agent.get(`/api/students/${student.id}/skills`)

    expect(res.body.evaluated_responses).toBe(1)
    expect(res.body.grammar).toBe(80)
    expect(res.body.speed).toBeNull()
  })
})
