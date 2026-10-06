/**
 * Tests de experiencia (XP) y progreso.
 *
 * Las reglas (cuánto vale una misión, la curva de nivel, la racha) son puras y
 * se prueban sin base de datos; además se comprueba que el envío real las
 * aplique y que el endpoint de progreso cuadre.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { completeChat } from '../src/lib/ai.ts'
import { createApp } from '../src/app.ts'
import { db } from '../src/db/client.ts'
import { evaluations, responses } from '../src/db/schema.ts'
import { levelProgress, missionXp, streakFromDays, xpForLevel } from '../src/lib/xp.ts'
import { resetDb } from './helpers/db.ts'
import { createMission, signupActor, type Actor } from './helpers/fixtures.ts'

const app = createApp()
const mockedCompleteChat = vi.mocked(completeChat)

/** Evaluación con las notas indicadas; ADVANCE si `advance`. */
function evaluationWith(scores: number[], advance = true) {
  return JSON.stringify({
    comprehensibility_score: scores[0],
    grammar_score: scores[1],
    lexical_richness_score: scores[2],
    judgment: advance ? 'ADVANCE' : 'PAUSE',
    feedback_text: 'CONTEXTO: bien.\n\nLOGRO: algo.\n\nMEJORA:\n- Una cosa.',
    detected_structures: ['present-simple'],
  })
}

async function submitResponse(student: Actor, missionId: string, text: string) {
  return student.agent
    .post(`/api/missions/${missionId}/submit`)
    .send({ response_text: text, time_taken_seconds: 60 })
}

/** Inserta una respuesta evaluada con su XP y fecha, para el progreso. */
async function seedEvaluation(
  student: Actor,
  missionId: string,
  xp: number,
  submittedAt: string,
  status: 'completed' | 'in_progress' = 'completed',
): Promise<void> {
  const responseId = randomUUID()
  await db.insert(responses).values({
    id: responseId,
    mission_id: missionId,
    student_id: student.id,
    text_content: 'texto',
    input_mode: 'text',
    transcript: null,
    time_taken_seconds: 90,
    submitted_at: new Date(submittedAt),
    status,
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
  mockedCompleteChat.mockReset()
})

describe('missionXp', () => {
  it('la primera vez paga base + desempeño + bonus', () => {
    // A2: 50 × 1.2 = 60 de base; media 80 → +15; bonus de primera vez +30.
    expect(missionXp({ cefrLevel: 'A2', completed: true, firstCompletion: true, scores: [80, 80, 80] })).toBe(105)
    // A1 perfecta: 50 + 25 + 30.
    expect(missionXp({ cefrLevel: 'A1', completed: true, firstCompletion: true, scores: [100, 100, 100] })).toBe(105)
    // C1 con media por debajo de 50 no suma desempeño.
    expect(missionXp({ cefrLevel: 'C1', completed: true, firstCompletion: true, scores: [40, 45, 45] })).toBe(140)
  })

  it('no completar da una parte y repetir da práctica', () => {
    expect(missionXp({ cefrLevel: 'A1', completed: false, firstCompletion: false, scores: [90, 90, 90] })).toBe(20)
    expect(missionXp({ cefrLevel: 'A1', completed: true, firstCompletion: false, scores: [90, 90, 90] })).toBe(13)
    // A2 sin completar: 60 × 0.4 = 24.
    expect(missionXp({ cefrLevel: 'A2', completed: false, firstCompletion: false, scores: [] })).toBe(24)
  })
})

describe('curva de nivel y racha', () => {
  it('el nivel sube a 100, 300, 600, 1000 XP', () => {
    expect(xpForLevel(1)).toBe(0)
    expect(xpForLevel(2)).toBe(100)
    expect(xpForLevel(3)).toBe(300)
    expect(xpForLevel(4)).toBe(600)

    expect(levelProgress(0)).toMatchObject({ level: 1, level_xp: 0, xp_to_next: 100 })
    expect(levelProgress(100)).toMatchObject({ level: 2, xp_to_next: 200 })
    expect(levelProgress(299)).toMatchObject({ level: 2, level_xp: 199, xp_to_next: 1 })
    expect(levelProgress(300)).toMatchObject({ level: 3, level_span: 300 })
  })

  it('la racha cuenta días seguidos y exige no dejar pasar un día entero', () => {
    const hoy = '2026-03-10'
    const ayer = '2026-03-09'

    expect(streakFromDays(new Set([hoy, ayer, '2026-03-08']), hoy, ayer)).toBe(3)
    // Sin envíos hoy pero con ayer: la racha sigue viva.
    expect(streakFromDays(new Set([ayer, '2026-03-08']), hoy, ayer)).toBe(2)
    // Un hueco la corta.
    expect(streakFromDays(new Set([hoy, '2026-03-08']), hoy, ayer)).toBe(1)
    // Ni hoy ni ayer: muerta.
    expect(streakFromDays(new Set(['2026-03-08']), hoy, ayer)).toBe(0)
  })
})

describe('el envío otorga XP', () => {
  it('completar por primera vez guarda XP en la evaluación', async () => {
    mockedCompleteChat.mockResolvedValue(evaluationWith([80, 80, 80]))
    const student = await signupActor(app, 'student', { cefr_level: 'A2' })
    const missionId = await createMission({ cefr_level: 'A2' })

    const res = await submitResponse(student, missionId, 'Excuse me, can you help me find the museum?')
    expect(res.status).toBe(200)

    const [row] = await db.select().from(evaluations)
    expect(row?.xp_awarded).toBe(105)
  })

  it('repetir una misión completada da mucha menos XP', async () => {
    mockedCompleteChat.mockResolvedValue(evaluationWith([80, 80, 80]))
    const student = await signupActor(app, 'student', { cefr_level: 'A2' })
    const missionId = await createMission({ cefr_level: 'A2' })

    await submitResponse(student, missionId, 'Excuse me, can you help me find the museum?')
    await submitResponse(student, missionId, 'Excuse me, can you help me find the museum please?')

    const rows = await db.select().from(evaluations)
    expect(rows).toHaveLength(2)
    expect(rows[0]?.xp_awarded).toBe(105)
    expect(rows[1]?.xp_awarded).toBe(15) // 60 × 0.25
  })

  it('no completar deja la parte proporcional y el spam no da nada', async () => {
    mockedCompleteChat.mockResolvedValue(evaluationWith([40, 40, 40], false))
    const student = await signupActor(app, 'student', { cefr_level: 'A1' })
    const missionId = await createMission({ cefr_level: 'A1' })

    await submitResponse(student, missionId, 'I am walking to the museum now')
    // Respuesta no genuina: se rechaza sin llamar al modelo.
    await submitResponse(student, missionId, 'asdfgh')

    const rows = await db.select().from(evaluations)
    const porFecha = rows.sort((a, b) => a.evaluated_at.getTime() - b.evaluated_at.getTime())
    expect(porFecha[0]?.xp_awarded).toBe(20) // 50 × 0.4
    expect(porFecha[1]?.xp_awarded).toBe(0)
  })
})

describe('GET /api/students/:id/xp', () => {
  it('exige sesión y solo lo ve el alumno o sus docentes', async () => {
    const student = await signupActor(app, 'student')
    const otro = await signupActor(app, 'student')

    expect((await request(app).get(`/api/students/${student.id}/xp`)).status).toBe(401)
    expect((await otro.agent.get(`/api/students/${student.id}/xp`)).status).toBe(403)
  })

  it('devuelve nivel, racha y totales reales', async () => {
    const student = await signupActor(app, 'student')
    const missionA = await createMission({ cefr_level: 'A1' })
    const missionB = await createMission({ cefr_level: 'A1' })

    const hoy = new Date()
    const ayer = new Date(hoy.getTime() - 86_400_000)
    await seedEvaluation(student, missionA, 250, ayer.toISOString())
    await seedEvaluation(student, missionB, 180, hoy.toISOString())

    const res = await student.agent.get(`/api/students/${student.id}/xp`)

    expect(res.status).toBe(200)
    expect(res.body.progress).toMatchObject({
      total_xp: 430,
      level: 3, // 430 está entre 300 (nivel 3) y 600
      streak: 2,
      missions_completed: 2,
      writing_seconds: 180,
      xp_today: 180,
    })
  })

  it('sin actividad devuelve nivel 1 y racha 0', async () => {
    const student = await signupActor(app, 'student')
    const res = await student.agent.get(`/api/students/${student.id}/xp`)

    expect(res.body.progress).toMatchObject({ total_xp: 0, level: 1, streak: 0, xp_today: 0 })
  })
})
