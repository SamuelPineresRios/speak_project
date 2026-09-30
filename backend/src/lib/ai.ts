/**
 * Cliente OpenRouter compartido.
 *
 * Todas las rutas que hablan con el LLM pasan por `completeChat`, de modo que
 * la URL, las cabeceras, el modelo por defecto y la forma de los errores viven
 * en un único sitio.
 */
import { env } from '../config/env.ts'
import { HttpError } from '../utils/http-error.ts'

const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions'

/** Modelo por defecto salvo que una ruta elija otro. */
export const DEFAULT_AI_MODEL = 'google/gemini-2.0-flash-001'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** Error devuelto por OpenRouter (status del proveedor, no del backend). */
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
 * Clave de OpenRouter o error 503.
 *
 * Sin clave la aplicación sigue funcionando (login, grupos, progreso); sólo
 * las funciones de IA quedan deshabilitadas con un error entendible.
 */
export function requireOpenRouterKey(): string {
  if (!env.openRouterApiKey) {
    throw new HttpError(503, 'Servicio de IA no configurado')
  }
  return env.openRouterApiKey
}

interface CompletionOptions {
  messages: ChatMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
  /** Pide al proveedor que responda con un objeto JSON. */
  jsonMode?: boolean
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
  jsonMode = false,
}: CompletionOptions): Promise<string> {
  const apiKey = requireOpenRouterKey()

  const body: Record<string, unknown> = { model, messages }
  if (temperature !== undefined) body.temperature = temperature
  if (maxTokens !== undefined) body.max_tokens = maxTokens
  if (jsonMode) body.response_format = { type: 'json_object' }

  const response = await fetch(OPENROUTER_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://vox.app',
      'X-Title': 'VOX',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    console.error('[AI] OpenRouter error:', response.status, detail)
    throw new AIProviderError(
      `AI Provider Error: ${response.status} - ${detail}`,
      response.status,
      detail,
    )
  }

  const result = (await response.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>
  }
  const content = result.choices?.[0]?.message?.content
  if (typeof content !== 'string' || content.length === 0) {
    console.error('[AI] Respuesta inválida del proveedor:', result)
    throw new AIProviderError('Invalid response from AI provider', 500)
  }

  return content
}
