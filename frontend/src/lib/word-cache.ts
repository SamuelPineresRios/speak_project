/**
 * Caché de fichas en memoria y calentado en segundo plano.
 *
 * `warmWords` avisa al backend de las palabras que están en pantalla para que
 * las vaya generando mientras el alumno lee. Así, cuando pasa el cursor, la
 * ficha ya está y el popover sale en milisegundos. La caché la comparten la
 * escena, el chat y la página de vocabulario.
 */

export interface WordCard {
  id: string
  word: string
  translation: string
  part_of_speech: string
  present: string | null
  past: string | null
  past_participle: string | null
  examples: Array<{ en: string; es: string }>
  saved: boolean
}

/** Fichas ya vistas en esta sesión: el hover no vuelve a pedirlas. */
const cards = new Map<string, WordCard>()

export function getCachedWord(word: string): WordCard | undefined {
  return cards.get(word.toLowerCase())
}

export function setCachedWord(word: string, card: WordCard): void {
  cards.set(word.toLowerCase(), card)
}

/** Tope por petición; el backend recorta en 60. */
const WARM_CHUNK = 60

/** Separa las palabras igual que lo hace `InteractiveWords` al pintarlas. */
export function extractWords(text: string): string[] {
  return text.match(/[\p{L}][\p{L}'’-]*/gu)?.map(word => word.toLowerCase()) ?? []
}

/**
 * Calienta las palabras de los textos dados, sin bloquear ni esperar la
 * respuesta del backend. Se llama cuando una escena o un mensaje aparece en
 * pantalla.
 *
 * Sólo se envían las palabras que esta sesión no tiene ya en memoria; las que
 * el servidor tenga cacheadas de todos modos las filtra él sin gastar IA.
 */
export function warmWords(texts: string[]): void {
  const pending = new Set<string>()
  for (const text of texts) {
    for (const word of extractWords(text)) {
      if (!cards.has(word)) pending.add(word)
    }
  }
  if (pending.size === 0) return

  const words = [...pending]
  for (let index = 0; index < words.length; index += WARM_CHUNK) {
    void fetch('/api/words/warm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words: words.slice(index, index + WARM_CHUNK) }),
    }).catch(() => {})
  }
}
