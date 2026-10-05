/**
 * Tests de las fichas de palabras y el vocabulario.
 *
 * La IA se mockea (una ficha conocida) para verificar que se genera una sola
 * vez por palabra, que guardar es idempotente y que cada alumno sólo ve lo
 * suyo.
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
import { normalizeWord } from '../src/modules/words/service.ts'
import { resetDb } from './helpers/db.ts'
import { signupActor } from './helpers/fixtures.ts'

const app = createApp()
const mockedCompleteChat = vi.mocked(completeChat)

/** Ficha que devolvería el modelo para "help". */
const HELP_CARD = JSON.stringify({
  translation: 'ayudar',
  part_of_speech: 'verb',
  present: 'help',
  past: 'helped',
  past_participle: 'helped',
  examples: [
    { en: 'Can you help me?', es: '¿Puedes ayudarme?' },
    { en: 'She helped her mother.', es: 'Ella ayudó a su madre.' },
  ],
})

beforeEach(async () => {
  await resetDb()
  mockedCompleteChat.mockReset()
  mockedCompleteChat.mockResolvedValue(HELP_CARD)
})

describe('normalizeWord', () => {
  it('quita mayúsculas y puntuación de los extremos', () => {
    expect(normalizeWord('  Help! ')).toBe('help')
    expect(normalizeWord('"Museum,"')).toBe('museum')
    // Los apóstrofos interiores se conservan: son parte de la palabra.
    expect(normalizeWord("Don't")).toBe("don't")
  })
})

describe('POST /api/words/lookup', () => {
  it('exige sesión', async () => {
    const res = await request(app).post('/api/words/lookup').send({ word: 'help' })
    expect(res.status).toBe(401)
  })

  it('rechaza una palabra vacía o sin letras', async () => {
    const student = await signupActor(app, 'student')
    expect((await student.agent.post('/api/words/lookup').send({ word: '   ' })).status).toBe(400)
    expect((await student.agent.post('/api/words/lookup').send({ word: '¿?' })).status).toBe(400)
    expect(mockedCompleteChat).not.toHaveBeenCalled()
  })

  it('devuelve la ficha completa', async () => {
    const student = await signupActor(app, 'student')
    const res = await student.agent
      .post('/api/words/lookup')
      .send({ word: 'Help!', context: 'Can you help me?' })

    expect(res.status).toBe(200)
    expect(res.body.card).toMatchObject({
      word: 'help',
      translation: 'ayudar',
      part_of_speech: 'verb',
      present: 'help',
      past: 'helped',
      past_participle: 'helped',
      saved: false,
    })
    expect(res.body.card.examples).toHaveLength(2)
  })

  it('genera la ficha una sola vez: la segunda consulta sale de caché', async () => {
    const student = await signupActor(app, 'student')

    await student.agent.post('/api/words/lookup').send({ word: 'help' })
    const segunda = await student.agent.post('/api/words/lookup').send({ word: 'HELP' })

    expect(mockedCompleteChat).toHaveBeenCalledTimes(1)
    expect(segunda.body.card.translation).toBe('ayudar')
  })
})

describe('vocabulario guardado', () => {
  it('guarda una palabra y aparece en la lista con su ficha', async () => {
    const student = await signupActor(app, 'student')

    const guardada = await student.agent
      .post('/api/words')
      .send({ word: 'help', context: 'Can you help me?' })
    expect(guardada.status).toBe(201)
    expect(guardada.body.card.saved).toBe(true)

    const lista = await student.agent.get('/api/words')
    expect(lista.status).toBe(200)
    expect(lista.body.words).toHaveLength(1)
    expect(lista.body.words[0]).toMatchObject({
      word: 'help',
      translation: 'ayudar',
      part_of_speech: 'verb',
      context: 'Can you help me?',
    })
    expect(lista.body.words[0].saved_at).toBeTruthy()
  })

  it('guardar dos veces la misma palabra no duplica la entrada', async () => {
    const student = await signupActor(app, 'student')

    await student.agent.post('/api/words').send({ word: 'help' })
    const repetida = await student.agent.post('/api/words').send({ word: 'help' })

    expect(repetida.status).toBe(201)
    const lista = await student.agent.get('/api/words')
    expect(lista.body.words).toHaveLength(1)
    // La ficha tampoco se regenera.
    expect(mockedCompleteChat).toHaveBeenCalledTimes(1)
  })

  it('la palabra queda marcada como guardada en el lookup', async () => {
    const student = await signupActor(app, 'student')

    await student.agent.post('/api/words').send({ word: 'help' })
    const lookup = await student.agent.post('/api/words/lookup').send({ word: 'help' })

    expect(lookup.body.card.saved).toBe(true)
  })

  it('cada alumno sólo ve su vocabulario', async () => {
    const alumno = await signupActor(app, 'student')
    const otro = await signupActor(app, 'student')

    await alumno.agent.post('/api/words').send({ word: 'help' })

    const listaOtro = await otro.agent.get('/api/words')
    expect(listaOtro.body.words).toHaveLength(0)
  })

  it('borra una palabra propia y rechaza borrar la ajena', async () => {
    const alumno = await signupActor(app, 'student')
    const otro = await signupActor(app, 'student')

    await alumno.agent.post('/api/words').send({ word: 'help' })
    const [palabra] = (await alumno.agent.get('/api/words')).body.words

    expect((await otro.agent.delete(`/api/words/${palabra.saved_id}`)).status).toBe(404)
    expect((await alumno.agent.delete(`/api/words/${palabra.saved_id}`)).status).toBe(204)
    expect((await alumno.agent.get('/api/words')).body.words).toHaveLength(0)
  })
})
