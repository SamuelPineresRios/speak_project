/**
 * Shared OpenRouter client.
 *
 * Every route that talks to the LLM goes through `completeChat` so the
 * endpoint, headers, model default and error shaping live in exactly one place.
 */

const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions'

/** Default model used across the app unless a route opts into another one. */
export const DEFAULT_AI_MODEL = 'google/gemini-2.0-flash-001'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: string,
  ) {
    super(message)
    this.name = 'AIProviderError'
  }
}

export function getOpenRouterApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY is not set in environment variables')
  return key
}

interface CompletionOptions {
  messages: ChatMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
  /** Ask the provider to answer with a JSON object body. */
  jsonMode?: boolean
}

/**
 * Runs a single chat completion and returns the assistant text.
 * Throws `AIProviderError` when the provider fails or answers with an empty body.
 */
export async function completeChat({
  messages,
  model = DEFAULT_AI_MODEL,
  temperature,
  maxTokens,
  jsonMode = false,
}: CompletionOptions): Promise<string> {
  const body: Record<string, unknown> = { model, messages }
  if (temperature !== undefined) body.temperature = temperature
  if (maxTokens !== undefined) body.max_tokens = maxTokens
  if (jsonMode) body.response_format = { type: 'json_object' }

  const response = await fetch(OPENROUTER_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getOpenRouterApiKey()}`,
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

  const result = await response.json()
  const content: unknown = result?.choices?.[0]?.message?.content
  if (typeof content !== 'string' || content.length === 0) {
    console.error('[AI] Invalid API response:', result)
    throw new AIProviderError('Invalid response from AI provider', 500)
  }

  return content
}
