/**
 * Cliente de Anthropic (Claude) compartido.
 *
 * Todas las rutas que hablan con el LLM pasan por `completeChat`, de modo que
 * la URL, las cabeceras, la traducción del formato y la forma de los errores
 * viven en un único sitio.
 *
 * La API de Anthropic no es compatible con la de OpenAI/OpenRouter:
 * - `system` no es un rol: viaja en un campo de nivel superior;
 * - `max_tokens` es obligatorio;
 * - no existe `response_format` (el JSON se pide por prompt);
 * - la respuesta es una lista de bloques de contenido, no `choices`.
 */
import { env } from '../config/env.ts'
import { HttpError } from '../utils/http-error.ts'

const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages'

/** Versión del contrato de la API; Anthropic exige enviarla siempre. */
const ANTHROPIC_VERSION = '2023-06-01'

/** Modelo por defecto: Haiku 4.5 con snapshot fijado (no el alias móvil). */
export const DEFAULT_AI_MODEL = env.anthropicModel ?? 'claude-haiku-4-5-20251001'

/** Anthropic exige `max_tokens`; este es el valor si la ruta no lo indica. */
const DEFAULT_MAX_TOKENS = 1024

/** Corta cada intento si el proveedor no responde. */
const REQUEST_TIMEOUT_MS = 60_000

/** Intentos totales ante fallos transitorios del proveedor. */
const MAX_ATTEMPTS = 3

/** Códigos que merecen un reintento: saturación, límite de tasa o caída. */
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504, 529])

/** Espera máxima aunque el proveedor pida más (no bloquear al alumno). */
const MAX_RETRY_DELAY_MS = 10_000

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Espera antes del intento `attempt`: lineal con algo de aleatoriedad. */
function backoffMs(attempt: number): number {
  const base = attempt * 600
  return base + Math.floor(Math.random() * 250)
}

/** Respeta `retry-after` del proveedor si viene y es razonable. */
function retryDelayMs(attempt: number, retryAfterHeader: string | null): number {
  if (retryAfterHeader) {
    const seconds = Number.parseInt(retryAfterHeader, 10)
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(seconds * 1000, MAX_RETRY_DELAY_MS)
    }
  }
  return backoffMs(attempt)
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** Error devuelto por el proveedor (status suyo, no del backend). */
export class AIProviderError extends Error {
  readonly status: number
  readonly detail: string | undefined

  constructor(message: string, status: number, detail?: string) {
    super(message)
    this.name = 'AIProviderError'
    this.status = status
    this.detail = detail
  }
}

/**
 * Clave de Anthropic o error 503.
 *
 * Sin clave la aplicación sigue funcionando (login, grupos, progreso); sólo
 * las funciones de IA quedan deshabilitadas con un error entendible.
 */
export function requireAnthropicKey(): string {
  if (!env.anthropicApiKey) {
    throw new HttpError(503, 'Servicio de IA no configurado')
  }
  return env.anthropicApiKey
}

interface CompletionOptions {
  messages: ChatMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
  /**
   * Esquema JSON que la respuesta debe cumplir. Anthropic lo aplica con
   * decodificación restringida (`output_config.format`), así que el cuerpo
   * llega siempre como JSON válido y sin vallas de markdown.
   */
  schema?: JsonSchema
}

/** Esquema JSON de la respuesta esperada. */
export type JsonSchema = Record<string, unknown>

interface AnthropicTurn {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Traduce la conversación al formato de Anthropic:
 * - los mensajes `system` salen del array y se concatenan en `system`;
 * - los turnos consecutivos del mismo rol se fusionan, porque la API espera
 *   turnos alternos.
 */
function toAnthropicPayload(messages: ChatMessage[]): {
  system: string
  messages: AnthropicTurn[]
} {
  const systemParts: string[] = []
  const turns: AnthropicTurn[] = []

  for (const message of messages) {
    if (message.role === 'system') {
      systemParts.push(message.content)
      continue
    }

    const last = turns[turns.length - 1]
    if (last && last.role === message.role) {
      last.content += `\n\n${message.content}`
    } else {
      turns.push({ role: message.role, content: message.content })
    }
  }

  return { system: systemParts.join('\n\n'), messages: turns }
}

/**
 * Ejecuta una completion y devuelve el texto del asistente.
 * Lanza `AIProviderError` si el proveedor falla o responde vacío.
 */
export async function completeChat({
  messages,
  model = DEFAULT_AI_MODEL,
  temperature,
  maxTokens,
  schema,
}: CompletionOptions): Promise<string> {
  const apiKey = requireAnthropicKey()
  const payload = toAnthropicPayload(messages)

  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens ?? DEFAULT_MAX_TOKENS,
    messages: payload.messages,
  }
  if (payload.system) body.system = payload.system
  if (temperature !== undefined) body.temperature = temperature
  if (schema) body.output_config = { format: { type: 'json_schema', schema } }

  const response = await requestWithRetry(apiKey, body)

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    console.error('[AI] Anthropic error:', response.status, detail)
    throw new AIProviderError(
      `AI Provider Error: ${response.status} - ${detail}`,
      response.status,
      detail,
    )
  }

  const result = (await response.json()) as {
    content?: Array<{ type?: string; text?: unknown }>
  }
  const text = result.content?.find(block => block.type === 'text')?.text
  if (typeof text !== 'string' || text.length === 0) {
    console.error('[AI] Respuesta inválida del proveedor:', result)
    throw new AIProviderError('Invalid response from AI provider', 500)
  }

  return text
}

/**
 * POST a Anthropic con reintentos.
 *
 * Los fallos de red y los códigos de saturación (429, 529...) son transitorios:
 * sin reintentos, un parpadeo de red dejaba al alumno con un error en mitad de
 * la conversación y tenía que reescribir su respuesta.
 *
 * Cada intento lleva su propio timeout: reutilizar la señal de un intento
 * abortado haría fallar el siguiente de inmediato.
 */
async function requestWithRetry(
  apiKey: string,
  body: Record<string, unknown>,
): Promise<Response> {
  let lastNetworkError: unknown

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(ANTHROPIC_MESSAGES_URL, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })

      const isLastAttempt = attempt === MAX_ATTEMPTS
      if (!RETRYABLE_STATUSES.has(response.status) || isLastAttempt) {
        return response
      }

      const delay = retryDelayMs(attempt, response.headers.get('retry-after'))
      console.warn(
        `[AI] El proveedor respondió ${response.status}; reintento ${attempt + 1}/${MAX_ATTEMPTS} en ${delay}ms`,
      )
      await sleep(delay)
    } catch (err) {
      lastNetworkError = err
      if (attempt === MAX_ATTEMPTS) break

      const delay = backoffMs(attempt)
      console.warn(
        `[AI] Fallo de red; reintento ${attempt + 1}/${MAX_ATTEMPTS} en ${delay}ms`,
        err,
      )
      await sleep(delay)
    }
  }

  // Red caída, DNS o timeouts agotados: es un fallo del proveedor, no del backend.
  console.error('[AI] No se pudo contactar con Anthropic tras varios intentos:', lastNetworkError)
  throw new AIProviderError('No se pudo contactar con el proveedor de IA', 502)
}
