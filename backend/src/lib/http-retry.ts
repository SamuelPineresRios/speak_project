/**
 * POST a un proveedor externo con reintentos.
 *
 * Los fallos de red y los códigos de saturación (429, 5xx) son transitorios:
 * sin reintentos, un parpadeo de red deja al usuario con un error en mitad de
 * una operación que estaba a punto de completarse.
 *
 * Cada intento lleva su propio timeout: reutilizar la señal de un intento
 * abortado haría fallar el siguiente de inmediato.
 *
 * Si se agotan los intentos por errores de red se lanza
 * `ProviderUnreachableError`; cada cliente lo traduce a su propio error
 * (la respuesta HTTP final la decide el módulo que lo usa).
 */

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Espera antes del intento `attempt`: lineal con algo de aleatoriedad. */
function backoffMs(attempt: number): number {
  return attempt * 600 + Math.floor(Math.random() * 250)
}

/** Respeta `retry-after` del proveedor si viene y es razonable. */
function retryDelayMs(attempt: number, retryAfterHeader: string | null, maxDelayMs: number): number {
  if (retryAfterHeader) {
    const seconds = Number.parseInt(retryAfterHeader, 10)
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(seconds * 1000, maxDelayMs)
    }
  }
  return Math.min(backoffMs(attempt), maxDelayMs)
}

/** El proveedor no respondió a ninguno de los intentos (red, DNS, timeout). */
export class ProviderUnreachableError extends Error {
  readonly cause: unknown

  constructor(cause: unknown) {
    super('No se pudo contactar con el proveedor')
    this.name = 'ProviderUnreachableError'
    this.cause = cause
  }
}

export interface RetryOptions {
  /** Corta cada intento si el proveedor no responde. */
  timeoutMs: number
  /** Etiqueta de los logs, p. ej. 'AI' o 'TTS'. */
  label: string
  maxAttempts?: number
  retryableStatuses?: ReadonlySet<number>
  /** Espera máxima aunque el proveedor pida más. */
  maxRetryDelayMs?: number
}

const DEFAULT_MAX_ATTEMPTS = 3
const DEFAULT_RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504])
const DEFAULT_MAX_RETRY_DELAY_MS = 10_000

export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  {
    timeoutMs,
    label,
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    retryableStatuses = DEFAULT_RETRYABLE_STATUSES,
    maxRetryDelayMs = DEFAULT_MAX_RETRY_DELAY_MS,
  }: RetryOptions,
): Promise<Response> {
  let lastNetworkError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
      })

      const isLastAttempt = attempt === maxAttempts
      if (!retryableStatuses.has(response.status) || isLastAttempt) {
        return response
      }

      const delay = retryDelayMs(attempt, response.headers.get('retry-after'), maxRetryDelayMs)
      console.warn(
        `[${label}] El proveedor respondió ${response.status}; reintento ${attempt + 1}/${maxAttempts} en ${delay}ms`,
      )
      await sleep(delay)
    } catch (err) {
      lastNetworkError = err
      if (attempt === maxAttempts) break

      const delay = Math.min(backoffMs(attempt), maxRetryDelayMs)
      console.warn(`[${label}] Fallo de red; reintento ${attempt + 1}/${maxAttempts} en ${delay}ms`, err)
      await sleep(delay)
    }
  }

  console.error(`[${label}] No se pudo contactar con el proveedor tras varios intentos:`, lastNetworkError)
  throw new ProviderUnreachableError(lastNetworkError)
}
