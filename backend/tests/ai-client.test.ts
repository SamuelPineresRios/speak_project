/**
 * Tests del adaptador de Anthropic.
 *
 * Se mockea `fetch`, no el módulo: lo que se protege aquí es la traducción del
 * formato (system aparte, max_tokens obligatorio, turnos alternos, bloques de
 * contenido), que es justo lo que se rompe al cambiar de proveedor.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// El cliente de IA no debe depender del entorno real para probar su formato:
// se inyecta una config con clave y sin modelo explícito.
vi.mock('../src/config/env.ts', () => ({
  env: {
    nodeEnv: 'test',
    isProduction: false,
    port: 0,
    databaseUrl: 'postgresql://no-se-usa',
    jwtSecret: 'test-jwt-secret-de-al-menos-32-caracteres',
    anthropicApiKey: 'test-anthropic-key',
    anthropicModel: null,
    adminEmails: [],
  },
}))

import { AIProviderError, completeChat } from '../src/lib/ai.ts'

const fetchMock = vi.fn()

/** Cada llamada necesita una Response nueva: una ya leída no se puede releer. */
function mockProviderReply(text = 'ok'): void {
  fetchMock.mockImplementation(() => Promise.resolve(textResponse(text)))
}

function textResponse(text: string, status = 200): Response {
  return new Response(JSON.stringify({ content: [{ type: 'text', text }] }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Cuerpo JSON de la última llamada al proveedor. */
function sentBody(): Record<string, unknown> {
  const call = fetchMock.mock.calls.at(-1)
  if (!call) throw new Error('No se llamó a fetch')
  return JSON.parse(String(call[1]?.body)) as Record<string, unknown>
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('traducción al formato de Anthropic', () => {
  it('llama a /v1/messages con x-api-key y versión de API', async () => {
    mockProviderReply('hola')

    await completeChat({ messages: [{ role: 'user', content: 'Hola' }] })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect((init.headers as Record<string, string>)['x-api-key']).toBe('test-anthropic-key')
    expect((init.headers as Record<string, string>)['anthropic-version']).toBeTruthy()
  })

  it('saca los mensajes system del array a su propio campo', async () => {
    mockProviderReply()

    await completeChat({
      messages: [
        { role: 'system', content: 'Eres un evaluador.' },
        { role: 'user', content: 'Evalúa esto.' },
      ],
    })

    const body = sentBody()
    expect(body.system).toBe('Eres un evaluador.')
    expect(body.messages).toEqual([{ role: 'user', content: 'Evalúa esto.' }])
  })

  it('envía siempre max_tokens (la API lo exige)', async () => {
    mockProviderReply()

    await completeChat({ messages: [{ role: 'user', content: 'Hola' }] })
    expect(sentBody().max_tokens).toEqual(expect.any(Number))

    await completeChat({
      messages: [{ role: 'user', content: 'Hola' }],
      maxTokens: 500,
    })
    expect(sentBody().max_tokens).toBe(500)
  })

  it('fusiona turnos consecutivos del mismo rol', async () => {
    mockProviderReply()

    await completeChat({
      messages: [
        { role: 'user', content: 'Primera' },
        { role: 'user', content: 'Segunda' },
        { role: 'assistant', content: 'Vale' },
      ],
    })

    expect(sentBody().messages).toEqual([
      { role: 'user', content: 'Primera\n\nSegunda' },
      { role: 'assistant', content: 'Vale' },
    ])
  })

  it('sin mensajes system no envía el campo system', async () => {
    mockProviderReply()

    await completeChat({ messages: [{ role: 'user', content: 'Hola' }] })

    expect(sentBody()).not.toHaveProperty('system')
  })

  it('con schema usa salida estructurada en output_config', async () => {
    mockProviderReply('{"ok":true}')

    const schema = {
      type: 'object',
      properties: { ok: { type: 'boolean' } },
      required: ['ok'],
      additionalProperties: false,
    }

    await completeChat({
      messages: [
        { role: 'system', content: 'Eres un evaluador.' },
        { role: 'user', content: 'Evalúa.' },
      ],
      schema,
    })

    const body = sentBody()
    expect(body.output_config).toEqual({
      format: { type: 'json_schema', schema },
    })
    // El system no se contamina con instrucciones extra.
    expect(body.system).toBe('Eres un evaluador.')
  })

  it('sin schema no envía output_config (el proveedor no restringe la salida)', async () => {
    mockProviderReply()

    await completeChat({ messages: [{ role: 'user', content: 'Hola' }] })

    expect(sentBody()).not.toHaveProperty('output_config')
  })

  it('propaga la temperatura sólo si se indica', async () => {
    mockProviderReply()

    await completeChat({ messages: [{ role: 'user', content: 'Hola' }] })
    expect(sentBody()).not.toHaveProperty('temperature')

    await completeChat({ messages: [{ role: 'user', content: 'Hola' }], temperature: 0.7 })
    expect(sentBody().temperature).toBe(0.7)
  })
})

describe('respuesta y errores', () => {
  it('devuelve el primer bloque de texto', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          content: [
            { type: 'thinking', thinking: '...' },
            { type: 'text', text: 'Respuesta final' },
          ],
        }),
        { status: 200 },
      ),
    )

    await expect(
      completeChat({ messages: [{ role: 'user', content: 'Hola' }] }),
    ).resolves.toBe('Respuesta final')
  })

  it('lanza AIProviderError con el status del proveedor', async () => {
    fetchMock.mockResolvedValue(new Response('rate limited', { status: 429 }))

    const error = await completeChat({
      messages: [{ role: 'user', content: 'Hola' }],
    }).catch((err: unknown) => err)

    expect(error).toBeInstanceOf(AIProviderError)
    expect((error as AIProviderError).status).toBe(429)
    expect((error as AIProviderError).detail).toContain('rate limited')
  })

  it('traduce un fallo de red a AIProviderError 502 (no un 500 genérico)', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))

    const error = await completeChat({
      messages: [{ role: 'user', content: 'Hola' }],
    }).catch((err: unknown) => err)

    expect(error).toBeInstanceOf(AIProviderError)
    expect((error as AIProviderError).status).toBe(502)
  })

  it('reintenta un fallo de red y devuelve la respuesta del intento que funciona', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockImplementationOnce(() => Promise.resolve(textResponse('recuperado')))

    await expect(
      completeChat({ messages: [{ role: 'user', content: 'Hola' }] }),
    ).resolves.toBe('recuperado')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('reintenta un 429 y respeta retry-after', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response('rate limited', { status: 429, headers: { 'retry-after': '0' } }),
      )
      .mockImplementationOnce(() => Promise.resolve(textResponse('ok tras esperar')))

    await expect(
      completeChat({ messages: [{ role: 'user', content: 'Hola' }] }),
    ).resolves.toBe('ok tras esperar')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('no reintenta un 400 (error del cliente)', async () => {
    fetchMock.mockResolvedValue(new Response('bad request', { status: 400 }))

    await expect(
      completeChat({ messages: [{ role: 'user', content: 'Hola' }] }),
    ).rejects.toBeInstanceOf(AIProviderError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('se rinde tras agotar los intentos y responde 502', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))

    const error = await completeChat({
      messages: [{ role: 'user', content: 'Hola' }],
    }).catch((err: unknown) => err)

    expect((error as AIProviderError).status).toBe(502)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('lanza AIProviderError si no hay bloque de texto', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ content: [{ type: 'thinking' }] }), { status: 200 }),
    )

    await expect(
      completeChat({ messages: [{ role: 'user', content: 'Hola' }] }),
    ).rejects.toBeInstanceOf(AIProviderError)
  })
})
