/**
 * Tests del texto a voz.
 *
 * El proveedor se mockea (nunca se llama a ElevenLabs) y la caché se aísla en
 * directorios temporales: lo que se comprueba es que una misma frase sólo se
 * sintetiza una vez y que la ruta responde lo correcto.
 */
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/lib/elevenlabs.ts', () => {
  class TTSProviderError extends Error {
    readonly status: number
    readonly detail: string | undefined

    constructor(message: string, status: number, detail?: string) {
      super(message)
      this.name = 'TTSProviderError'
      this.status = status
      this.detail = detail
    }
  }

  return {
    TTS_MODEL: 'test-model',
    TTSProviderError,
    requireElevenLabsKey: vi.fn(() => 'test-key'),
    synthesizeSpeech: vi.fn(),
  }
})

import { TTSProviderError, synthesizeSpeech } from '../src/lib/elevenlabs.ts'
import { createApp } from '../src/app.ts'
import { getSpeech, MAX_TEXT_LENGTH } from '../src/modules/tts/service.ts'
import { resetDb } from './helpers/db.ts'
import { signupActor } from './helpers/fixtures.ts'

const app = createApp()
const mockedSynthesize = vi.mocked(synthesizeSpeech)
const AUDIO = Buffer.from('ID3-fake-mp3')

/** Directorio que usa la app en los tests (ver vitest.config.ts). */
const routeCacheDir = process.env.TTS_CACHE_DIR as string
/** Directorio propio de cada test de servicio. */
let cacheDir: string

beforeEach(async () => {
  await resetDb()
  mockedSynthesize.mockReset()
  cacheDir = await mkdtemp(join(tmpdir(), 'vox-tts-'))
  // Un MP3 falso cacheado en una ejecución anterior haría fallar el "miss".
  await rm(routeCacheDir, { recursive: true, force: true })
})

afterEach(async () => {
  await rm(cacheDir, { recursive: true, force: true })
})

describe('servicio de voz con caché', () => {
  it('sintetiza una frase una sola vez y después la sirve de caché', async () => {
    mockedSynthesize.mockResolvedValue(AUDIO)

    const first = await getSpeech({ text: 'Hello there', voice: 'a', cacheDir })
    const second = await getSpeech({ text: 'Hello there', voice: 'a', cacheDir })

    expect(mockedSynthesize).toHaveBeenCalledTimes(1)
    expect(first.cached).toBe(false)
    expect(second.cached).toBe(true)
    expect(second.audio.equals(AUDIO)).toBe(true)
  })

  it('cada voz tiene su propia caché', async () => {
    mockedSynthesize.mockResolvedValue(AUDIO)

    await getSpeech({ text: 'Hello', voice: 'a', cacheDir })
    await getSpeech({ text: 'Hello', voice: 'b', cacheDir })

    expect(mockedSynthesize).toHaveBeenCalledTimes(2)
  })

  it('rechaza frases vacías o demasiado largas sin llamar al proveedor', async () => {
    await expect(getSpeech({ text: '   ', voice: 'a', cacheDir })).rejects.toMatchObject({
      status: 400,
    })
    await expect(
      getSpeech({ text: 'a'.repeat(MAX_TEXT_LENGTH + 1), voice: 'a', cacheDir }),
    ).rejects.toMatchObject({ status: 400 })
    expect(mockedSynthesize).not.toHaveBeenCalled()
  })
})

describe('GET /api/tts', () => {
  it('exige sesión', async () => {
    const res = await request(app).get('/api/tts').query({ text: 'Hello' })
    expect(res.status).toBe(401)
  })

  it('devuelve audio y en la segunda petición sale de caché', async () => {
    mockedSynthesize.mockResolvedValue(AUDIO)
    const student = await signupActor(app, 'student')

    const first = await student.agent.get('/api/tts').query({ text: 'Good morning', voice: 'a' })
    expect(first.status).toBe(200)
    expect(first.headers['content-type']).toContain('audio/mpeg')
    expect(first.headers['x-tts-cache']).toBe('miss')

    const second = await student.agent.get('/api/tts').query({ text: 'Good morning', voice: 'a' })
    expect(second.status).toBe(200)
    expect(second.headers['x-tts-cache']).toBe('hit')
    expect(mockedSynthesize).toHaveBeenCalledTimes(1)
  })

  it('traduce el fallo del proveedor a 502', async () => {
    mockedSynthesize.mockRejectedValue(new TTSProviderError('boom', 402))
    const student = await signupActor(app, 'student')

    const res = await student.agent.get('/api/tts').query({ text: 'Hello' })
    expect(res.status).toBe(502)
  })
})
