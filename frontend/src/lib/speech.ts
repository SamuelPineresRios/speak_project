/**
 * Voz compartida: audio del backend (ElevenLabs, cacheado en disco) con
 * reserva en la voz nativa del navegador.
 *
 * La escena narrativa tiene su propia versión con analizador de audio para
 * mover la boca; esta es la simple, para pronunciar palabras del vocabulario.
 */

/** URL del MP3 sintetizado por el backend (voz natural y cacheada). */
export function speechUrl(text: string, role: 'A' | 'B' = 'A'): string {
  return `/api/tts?voice=${role.toLowerCase()}&text=${encodeURIComponent(text)}`
}

/**
 * Utterance en inglés lista para hablar. La escena narrativa la usa y le añade
 * sus callbacks (mover la boca); aquí se habla directamente.
 */
export function englishUtterance(text: string): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.95
  return utterance
}

/** Reserva: la voz nativa del navegador, para móviles y equipos sin clave. */
export function speakNative(text: string): void {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.speak(englishUtterance(text))
}

/** Audio en curso, para poder cortarlo al reproducir otro. */
let current: HTMLAudioElement | null = null

/** Corta la voz actual (la del backend o la nativa). */
export function stopSpeaking(): void {
  if (current) {
    current.pause()
    current = null
  }
  window.speechSynthesis?.cancel()
}

/** URL de la grabación libre de una palabra (Wikimedia, cacheada en el backend). */
export function pronunciationUrl(word: string): string {
  return `/api/words/pronunciation?word=${encodeURIComponent(word)}`
}

/** Una sola palabra en inglés: ni frases, ni números, ni signos sueltos. */
const SINGLE_WORD = /^[\p{L}][\p{L}'’-]*$/u

function play(url: string, onFail: () => void): void {
  const audio = new Audio(url)
  current = audio
  audio.addEventListener('ended', () => {
    if (current === audio) current = null
  })
  audio.play().catch(() => {
    if (current === audio) onFail()
  })
}

/** TTS del backend (ElevenLabs, cacheado) con reserva en la voz nativa. */
function speakWithTts(text: string, role: 'A' | 'B'): void {
  play(speechUrl(text, role), () => speakNative(text))
}

/**
 * Pronuncia un texto. Para **palabras sueltas** usa primero la grabación
 * humana y gratuita de Wikimedia; si no hay, cae al TTS del backend y luego a
 * la voz nativa. Las frases van directas al TTS.
 */
export function speakText(text: string, role: 'A' | 'B' = 'A'): void {
  stopSpeaking()
  const word = text.trim()
  if (SINGLE_WORD.test(word)) {
    play(pronunciationUrl(word), () => speakWithTts(text, role))
    return
  }
  speakWithTts(text, role)
}
