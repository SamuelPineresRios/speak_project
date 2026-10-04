/**
 * Cliente de ElevenLabs (texto a voz).
 *
 * Mismo patrón que `lib/ai.ts`: URL, cabeceras, timeout, reintentos y forma de
 * los errores viven en un único sitio. Devuelve el MP3 como Buffer para que el
 * módulo de voz lo cachee y lo sirva.
 *
 * Ojo con el 401: en ElevenLabs no siempre significa clave inválida. Una clave
 * restringida sin el permiso `text_to_speech`, una voz de pago en plan
 * gratuito (402) o la cuota agotada también viajan como 401. Por eso no se
 * propaga el status del proveedor: la ruta responde 502 y el navegador cae a
 * su voz nativa.
 */
import { env } from '../config/env.ts'
import { HttpError } from '../utils/http-error.ts'
import { fetchWithRetry, ProviderUnreachableError } from './http-retry.ts'

const ELEVENLABS_TTS_URL = 'https://api.elevenlabs.io/v1/text-to-speech'

/**
 * Flash v2.5: en el plan gratuito cuesta la mitad de créditos por carácter que
 * Multilingual v2 y tiene mucha menos latencia. Para frases de diálogo la
 * calidad sobra.
 */
export const TTS_MODEL = 'eleven_flash_v2_5'

/** Formato de salida fijado para que el MP3 cacheado sea siempre el mismo. */
const OUTPUT_FORMAT = 'mp3_44100_128'

/** Corta cada intento si el proveedor no responde. */
const REQUEST_TIMEOUT_MS = 30_000

/** Códigos que merecen un reintento: saturación o caída. */
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504])

/** Error devuelto por el proveedor (status suyo, no del backend). */
export class TTSProviderError extends Error {
  readonly status: number
  readonly detail: string | undefined

  constructor(message: string, status: number, detail?: string) {
    super(message)
    this.name = 'TTSProviderError'
    this.status = status
    this.detail = detail
  }
}

/**
 * Clave de ElevenLabs o error 503.
 *
 * Sin clave la aplicación sigue funcionando: la escena usa la voz nativa del
 * navegador si la tiene.
 */
export function requireElevenLabsKey(): string {
  if (!env.elevenLabsApiKey) {
    throw new HttpError(503, 'Servicio de voz no configurado')
  }
  return env.elevenLabsApiKey
}

/** Sintetiza `text` con la voz indicada y devuelve el MP3. */
export async function synthesizeSpeech({
  text,
  voiceId,
}: {
  text: string
  voiceId: string
}): Promise<Buffer> {
  const apiKey = requireElevenLabsKey()

  let response: Response
  try {
    response = await fetchWithRetry(
      `${ELEVENLABS_TTS_URL}/${encodeURIComponent(voiceId)}?output_format=${OUTPUT_FORMAT}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({ text, model_id: TTS_MODEL }),
      },
      { timeoutMs: REQUEST_TIMEOUT_MS, label: 'TTS', retryableStatuses: RETRYABLE_STATUSES },
    )
  } catch (err) {
    if (err instanceof ProviderUnreachableError) {
      throw new TTSProviderError('No se pudo contactar con el proveedor de voz', 502)
    }
    throw err
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    console.error('[TTS] ElevenLabs error:', response.status, detail)
    throw new TTSProviderError(`TTS Provider Error: ${response.status}`, response.status, detail)
  }

  const audio = Buffer.from(await response.arrayBuffer())
  if (audio.length === 0) {
    console.error('[TTS] El proveedor devolvió audio vacío')
    throw new TTSProviderError('Audio vacío del proveedor', 502)
  }

  return audio
}
