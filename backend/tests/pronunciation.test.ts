/**
 * Tests de la pronunciación libre (grabaciones de Wikimedia).
 *
 * La red se mockea por completo: se comprueba la elección del fichero inglés,
 * la caché en disco y el marcador de «esta palabra no tiene grabación».
 */
import { rm } from 'node:fs/promises'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from '../src/app.ts'
import { resetDb } from './helpers/db.ts'
import { signupActor } from './helpers/fixtures.ts'

const app = createApp()
const AUDIO = Buffer.from('ID3-fake-mp3')
const cacheDir = process.env.PRONUNCIATION_CACHE_DIR as string

/** Respuesta falsa de la API de Wiktionary con los ficheros indicados. */
function imagesResponse(files: string[]) {
  return {
    query: { pages: { 1: { title: 'word', images: files.map(title => ({ title })) } } },
  }
}

/** Respuesta falsa de Commons con (o sin) el MP3 transcodificado. */
function derivativesResponse(mp3: string | null, original = 'https://upload.wikimedia.org/original.ogg') {
  const derivatives = [{ src: original }, ...(mp3 ? [{ transcodekey: 'mp3', src: mp3 }] : [])]
  return { query: { pages: { 1: { title: 'File:x', videoinfo: [{ derivatives }] } } } }
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(async () => {
  await resetDb()
  await rm(cacheDir, { recursive: true, force: true })
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

/** Enruta las URLs: wiktionary, commons y la descarga del audio. */
function routeFetch({ files, mp3 }: { files: string[]; mp3: string | null }) {
  fetchMock.mockImplementation(async (url: string) => {
    if (url.includes('en.wiktionary.org')) {
      return new Response(JSON.stringify(imagesResponse(files)), { status: 200 })
    }
    if (url.includes('commons.wikimedia.org')) {
      return new Response(JSON.stringify(derivativesResponse(mp3)), { status: 200 })
    }
    return new Response(AUDIO, { status: 200 })
  })
}

describe('GET /api/words/pronunciation', () => {
  it('exige sesión', async () => {
    const res = await request(app).get('/api/words/pronunciation?word=help')
    expect(res.status).toBe(401)
  })

  it('rechaza una palabra vacía', async () => {
    const student = await signupActor(app, 'student')
    const res = await student.agent.get('/api/words/pronunciation?word=%20%20')
    expect(res.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('devuelve la grabación y la cachea', async () => {
    const student = await signupActor(app, 'student')
    routeFetch({
      files: ['File:Nl-help.ogg', 'File:En-uk-help.ogg', 'File:En-us-help.ogg'],
      mp3: 'https://upload.wikimedia.org/transcoded/En-us-help.ogg.mp3',
    })

    const primera = await student.agent.get('/api/words/pronunciation?word=help')
    expect(primera.status).toBe(200)
    expect(primera.headers['content-type']).toContain('audio/mpeg')
    expect(primera.headers['x-pronunciation-cache']).toBe('miss')

    const llamadasTrasPrimera = fetchMock.mock.calls.length

    const segunda = await student.agent.get('/api/words/pronunciation?word=help')
    expect(segunda.status).toBe(200)
    expect(segunda.headers['x-pronunciation-cache']).toBe('hit')
    // La segunda sale del disco: no vuelve a tocar la red.
    expect(fetchMock.mock.calls.length).toBe(llamadasTrasPrimera)
  })

  it('prefiere la grabación de inglés americano', async () => {
    const student = await signupActor(app, 'student')
    routeFetch({
      files: ['File:Nl-help.ogg', 'File:En-uk-help.ogg', 'File:En-us-help.ogg'],
      mp3: 'https://upload.wikimedia.org/transcoded/En-us-help.ogg.mp3',
    })

    await student.agent.get('/api/words/pronunciation?word=help')

    const consultaCommons = String(fetchMock.mock.calls[1]?.[0] ?? '')
    expect(consultaCommons).toContain('commons.wikimedia.org')
    expect(decodeURIComponent(consultaCommons)).toContain('En-us-help.ogg')
  })

  it('sin grabación inglesa responde 404 y no repite la búsqueda', async () => {
    const student = await signupActor(app, 'student')
    routeFetch({ files: ['File:Nl-help.ogg', 'File:Fr-help.ogg'], mp3: null })

    expect((await student.agent.get('/api/words/pronunciation?word=help')).status).toBe(404)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // El marcador de «sin audio» evita volver a la red.
    expect((await student.agent.get('/api/words/pronunciation?word=help')).status).toBe(404)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('si Wikimedia falla responde 404 sin marcar la palabra como muda', async () => {
    const student = await signupActor(app, 'student')
    fetchMock.mockRejectedValue(new Error('red caída'))

    expect((await student.agent.get('/api/words/pronunciation?word=help')).status).toBe(404)

    // Un fallo de red no debe dejar la palabra marcada para siempre.
    routeFetch({ files: ['File:En-us-help.ogg'], mp3: 'https://upload.wikimedia.org/transcoded/En-us-help.ogg.mp3' })
    expect((await student.agent.get('/api/words/pronunciation?word=help')).status).toBe(200)
  })
})
