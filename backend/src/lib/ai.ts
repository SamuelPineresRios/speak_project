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

/** Corta la petición si el proveedor no responde; evita peticiones colgadas. */
const REQUEST_TIMEOUT_MS = 60_000

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

  let response: Response
  try {
    response = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (err) {
    // Red caída, DNS, timeout...: es un fallo del proveedor, no del backend.
    console.error('[AI] No se pudo contactar con Anthropic:', err)
    throw new AIProviderError('No se pudo contactar con el proveedor de IA', 502)
  }

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
