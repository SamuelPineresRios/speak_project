/**
 * Voz compartida: grabación libre de Wikimedia (palabras), TTS del backend
 * (ElevenLabs, cacheado) y reserva en la voz nativa del navegador.
 *
 * La escena narrativa tiene su propia versión con analizador de audio para
 * mover la boca; esta es la simple, para el vocabulario.
 */

/** URL del MP3 sintetizado por el backend (voz natural y cacheada). */
export function speechUrl(text: string, role: 'A' | 'B' = 'A'): string {
  return `/api/tts?voice=${role.toLowerCase()}&text=${encodeURIComponent(text)}`
}

/** URL de la grabación libre de una palabra (Wikimedia, cacheada en el backend). */
export function pronunciationUrl(word: string): string {
  return `/api/words/pronunciation?word=${encodeURIComponent(word)}`
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

/** ¿Hay alguna voz instalada en el sistema? Sin motores, hablar es imposible. */
export function hasNativeVoice(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  return window.speechSynthesis.getVoices().length > 0
}

/** Reserva nativa. Devuelve false si el equipo no tiene voces instaladas. */
export function speakNative(text: string): boolean {
  if (!hasNativeVoice()) return false
  window.speechSynthesis.speak(englishUtterance(text))
  return true
}

/** Audio en curso, para poder cortarlo al reproducir otro. */
let current: HTMLAudioElement | null = null

/** Sube en cada reproducción: las cadenas viejas se abandonan solas. */
let generation = 0

/** Corta la voz actual (la del backend o la nativa). */
export function stopSpeaking(): void {
  if (current) {
    current.pause()
    current = null
  }
  window.speechSynthesis?.cancel()
}

/** Reproduce una URL; true si el audio llegó a sonar. */
function play(url: string): Promise<boolean> {
  return new Promise(resolve => {
    const audio = new Audio(url)
    current = audio
    audio.addEventListener('ended', () => {
      if (current === audio) current = null
    })
    audio
      .play()
      .then(() => resolve(true))
      .catch(() => resolve(false))
  })
}

/** Una sola palabra en inglés: ni frases, ni números, ni signos sueltos. */
const SINGLE_WORD = /^[\p{L}][\p{L}'’-]*$/u

/**
 * Pronuncia un texto. Para **palabras sueltas** usa primero la grabación
 * humana y gratuita de Wikimedia; si no hay, cae al TTS del backend y luego a
 * la voz nativa. Las frases van directas al TTS.
 *
 * Resuelve `true` solo si algo llegó a sonar: con `false`, el equipo no tiene
 * ni grabación, ni TTS y ni siquiera voces del sistema.
 */
export async function speakText(text: string, role: 'A' | 'B' = 'A'): Promise<boolean> {
  stopSpeaking()
  const stamp = ++generation
  const vigente = () => generation === stamp

  const word = text.trim()
  if (SINGLE_WORD.test(word) && (await play(pronunciationUrl(word)))) return true
  if (!vigente()) return false
  if (await play(speechUrl(text, role))) return true
  if (!vigente()) return false
  return speakNative(text)
}
