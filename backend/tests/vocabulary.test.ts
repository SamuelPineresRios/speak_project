/**
 * Tests del vocabulario clave de la misión.
 *
 * Lo esencial: que salgan SIEMPRE 7 palabras, que se genere una sola vez por
 * misión (la llamada al modelo es cara) y que las opciones sirvan para la
 * actividad (la correcta + 3 incorrectas verosímiles, sin repetidos).
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

import request from 'supertest'
import { AIProviderError, completeChat } from '../src/lib/ai.ts'
import { createApp } from '../src/app.ts'
import { db } from '../src/db/client.ts'
import { mission_introductions } from '../src/db/schema.ts'
import { validateWords } from '../src/modules/vocabulary/service.ts'
import { resetDb } from './helpers/db.ts'
import { createMission, signupActor } from './helpers/fixtures.ts'

const app = createApp()
const mockedCompleteChat = vi.mocked(completeChat)

/** Respuesta válida con `count` palabras, como la devolvería el modelo. */
function vocabularyResponse(count = 7): string {
  return JSON.stringify({
    words: Array.from({ length: count }, (_, index) => ({
      word: `word${index}`,
      translation: `traducción ${index}`,
      distractors: [`malo ${index}a`, `malo ${index}b`, `malo ${index}c`],
      explanation: `Explicación de la palabra ${index}.`,
    })),
  })
}

/** Inserta una escena guardada para comprobar que alimenta el prompt. */
async function createScene(missionId: string): Promise<void> {
  await db.insert(mission_introductions).values({
    id: 'intro-vocab-test',
    mission_id: missionId,
    scene_title: 'Pidiendo direcciones',
    scene_description: 'Una calle del centro con un turista perdido.',
    characters: [
      { id: 'A', name: 'Street Guide', role: 'Guía local', emoji: '🧑', played_by: 'ai' },
      { id: 'B', name: 'Alex', role: 'Turista', emoji: '🧑', played_by: 'student' },
    ],
    lines: [
      { speaker: 'A', text: 'Turn right at the corner, please.', translation: 'Gira a la derecha en la esquina.' },
      { speaker: 'B', text: 'Thank you very much!', translation: '¡Muchas gracias!' },
      { speaker: 'A', text: 'The museum is on your left.', translation: 'El museo está a tu izquierda.' },
      { speaker: 'B', text: 'Is it far from here?', translation: '¿Está lejos de aquí?' },
    ],
    useful_expressions: ['Turn right', 'On your left', 'Is it far?'],
    generated_by: 'test',
  })
}

beforeEach(async () => {
  await resetDb()
  mockedCompleteChat.mockReset()
  mockedCompleteChat.mockResolvedValue(vocabularyResponse(7))
})

describe('GET /api/missions/:id/vocabulary', () => {
  it('responde 401 sin sesión', async () => {
    const res = await request(app).get('/api/missions/m-1/vocabulary')
    expect(res.status).toBe(401)
  })

  it('responde 404 si la misión no existe', async () => {
    const student = await signupActor(app, 'student')
    const res = await student.agent.get('/api/missions/no-existe/vocabulary')

    expect(res.status).toBe(404)
    expect(mockedCompleteChat).not.toHaveBeenCalled()
  })

  it('genera exactamente 7 palabras y las reutiliza para todos', async () => {
    const student = await signupActor(app, 'student')
    const otro = await signupActor(app, 'student')
    const missionId = await createMission({ cefr_level: 'A2' })

    const primera = await student.agent.get(`/api/missions/${missionId}/vocabulary`)
    expect(primera.status).toBe(200)
    expect(primera.body.vocabulary.words).toHaveLength(7)
    expect(mockedCompleteChat).toHaveBeenCalledTimes(1)

    // El segundo alumno no dispara otra generación.
    const segunda = await otro.agent.get(`/api/missions/${missionId}/vocabulary`)
    expect(segunda.status).toBe(200)
    expect(segunda.body.vocabulary.words).toHaveLength(7)
    expect(mockedCompleteChat).toHaveBeenCalledTimes(1)
  })

  it('devuelve 4 opciones por palabra, con la correcta incluida y sin repetir', async () => {
    const student = await signupActor(app, 'student')
    const missionId = await createMission({ cefr_level: 'A1' })

    const res = await student.agent.get(`/api/missions/${missionId}/vocabulary`)

    for (const word of res.body.vocabulary.words) {
      expect(word.options).toHaveLength(4)
      expect(new Set(word.options).size).toBe(4)
      expect(word.options).toContain(word.translation)
      expect(word.distractors).toHaveLength(3)
    }
  })

  it('recorta a 7 si el modelo devuelve de más', async () => {
    mockedCompleteChat.mockResolvedValue(vocabularyResponse(10))
    const student = await signupActor(app, 'student')
    const missionId = await createMission({ cefr_level: 'B1' })

    const res = await student.agent.get(`/api/missions/${missionId}/vocabulary`)

    expect(res.status).toBe(200)
    expect(res.body.vocabulary.words).toHaveLength(7)
    expect(mockedCompleteChat).toHaveBeenCalledTimes(1)
  })

  it('reintenta si el modelo trae menos de 7 y devuelve 502 si no lo logra', async () => {
    mockedCompleteChat.mockResolvedValue(vocabularyResponse(6))
    const student = await signupActor(app, 'student')
    const missionId = await createMission({ cefr_level: 'B2' })

    const res = await student.agent.get(`/api/missions/${missionId}/vocabulary`)

    expect(res.status).toBe(502)
    expect(mockedCompleteChat).toHaveBeenCalledTimes(2)
  })

  it('acepta el segundo intento cuando el primero traía menos palabras', async () => {
    mockedCompleteChat
      .mockResolvedValueOnce(vocabularyResponse(5))
      .mockResolvedValueOnce(vocabularyResponse(7))
    const student = await signupActor(app, 'student')
    const missionId = await createMission({ cefr_level: 'C1' })

    const res = await student.agent.get(`/api/missions/${missionId}/vocabulary`)

    expect(res.status).toBe(200)
    expect(res.body.vocabulary.words).toHaveLength(7)
    expect(mockedCompleteChat).toHaveBeenCalledTimes(2)
  })

  it('traduce el proveedor caído a 502, no a 500', async () => {
    mockedCompleteChat.mockRejectedValue(new AIProviderError('sin red', 502))
    const student = await signupActor(app, 'student')
    const missionId = await createMission({ cefr_level: 'A2' })

    const res = await student.agent.get(`/api/missions/${missionId}/vocabulary`)

    expect(res.status).toBe(502)
    expect(res.body).toEqual({ error: 'El proveedor de IA no respondió' })
  })

  it('usa la escena narrativa como contexto del prompt', async () => {
    const student = await signupActor(app, 'student')
    const missionId = await createMission({ cefr_level: 'A2' })
    await createScene(missionId)

    await student.agent.get(`/api/missions/${missionId}/vocabulary`)

    const prompt = mockedCompleteChat.mock.calls[0]?.[0]?.messages?.[0]?.content ?? ''
    expect(prompt).toContain('Turn right at the corner, please.')
    expect(prompt).toContain('Pidiendo direcciones')
    expect(prompt).toContain('EXACTLY 7')
  })
})

describe('POST /api/missions/:id/vocabulary/regenerate', () => {
  it('solo los docentes pueden regenerarlo', async () => {
    const student = await signupActor(app, 'student')
    const missionId = await createMission({ cefr_level: 'B1' })

    const res = await student.agent.post(`/api/missions/${missionId}/vocabulary/regenerate`)
    expect(res.status).toBe(403)
  })

  it('el docente obtiene vocabulario nuevo y sube la versión', async () => {
    const teacher = await signupActor(app, 'teacher')
    const student = await signupActor(app, 'student')
    const missionId = await createMission({ cefr_level: 'B1' })

    const primera = await student.agent.get(`/api/missions/${missionId}/vocabulary`)
    expect(primera.body.vocabulary.version).toBe(1)

    const regenerada = await teacher.agent.post(`/api/missions/${missionId}/vocabulary/regenerate`)
    expect(regenerada.status).toBe(200)
    expect(regenerada.body.vocabulary.version).toBe(2)
  })
})

describe('validateWords', () => {
  it('exige 3 distractores distintos y que no coincidan con la traducción', () => {
    const base = {
      word: 'help',
      translation: 'ayudar',
      distractors: ['comprar', 'esperar', 'viajar'],
      explanation: 'Prestar ayuda.',
    }

    expect(validateWords({ words: [base] })).toBeNull() // con una sola no llega a 7
    expect(
      validateWords({ words: Array.from({ length: 7 }, () => base) }),
    ).toBeNull() // repetida
    expect(
      validateWords({
        words: [
          { ...base, distractors: ['comprar', 'comprar', 'viajar'] },
          ...Array.from({ length: 6 }, (_, i) => ({ ...base, word: `w${i}`, distractors: ['a', 'b', 'c'] })),
        ],
      }),
    ).toBeNull() // distractores repetidos
    expect(
      validateWords({
        words: [
          { ...base, distractors: ['ayudar', 'esperar', 'viajar'] },
          ...Array.from({ length: 6 }, (_, i) => ({ ...base, word: `w${i}`, distractors: ['a', 'b', 'c'] })),
        ],
      }),
    ).toBeNull() // un distractor es la propia traducción
  })

  it('rechaza dos palabras que enseñan el mismo significado', () => {
    const base = {
      translation: 'aparecer',
      distractors: ['a', 'b', 'c'],
      explanation: 'e',
    }
    const words = [
      { ...base, word: 'appear' },
      { ...base, word: 'showing up' },
      ...Array.from({ length: 5 }, (_, i) => ({
        word: `w${i}`,
        translation: `t${i}`,
        distractors: [`a${i}`, `b${i}`, `c${i}`],
        explanation: `e${i}`,
      })),
    ]

    expect(validateWords({ words })).toBeNull()
  })

  it('devuelve exactamente 7 cuando son válidas y recorta las de más', () => {
    const words = Array.from({ length: 9 }, (_, i) => ({
      word: `word${i}`,
      translation: `t${i}`,
      distractors: [`a${i}`, `b${i}`, `c${i}`],
      explanation: `e${i}`,
    }))

    const valid = validateWords({ words })
    expect(valid).toHaveLength(7)
    expect(valid?.[0]?.word).toBe('word0')
  })
})
