/**
 * Servicio de texto a voz con caché en disco.
 *
 * Cada frase distinta se sintetiza una sola vez: el MP3 queda en disco y las
 * siguientes peticiones —de cualquier alumno— lo reutilizan. Con el plan
 * gratuito de ElevenLabs (10.000 caracteres al mes) la caché no es un lujo:
 * sin ella, sólo la primera vuelta por las 75 misiones agotaría la cuota.
 *
 * La escritura es atómica (temporal + rename) para que dos peticiones
 * simultáneas de la misma frase nunca lean un MP3 a medias. Si ambas
 * sintetizan a la vez se paga dos veces esa frase una única vez; el
 * aislamiento no merece más complejidad.
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { env } from '../../config/env.ts'
import { synthesizeSpeech, TTS_MODEL } from '../../lib/elevenlabs.ts'
import { HttpError } from '../../utils/http-error.ts'

/** Tope defensivo: las frases de diálogo rondan los 80 caracteres. */
export const MAX_TEXT_LENGTH = 300

/** Los dos personajes de la escena: A (IA) y B (alumno). */
export type TtsVoice = 'a' | 'b'

/** Normaliza el parámetro `voice` de la petición; cualquier cosa es la voz A. */
export function normalizeVoice(value: unknown): TtsVoice {
  return value === 'b' ? 'b' : 'a'
}

function voiceIdFor(voice: TtsVoice): string {
  return voice === 'b' ? env.elevenLabsVoiceB : env.elevenLabsVoiceA
}

/**
 * Ruta del MP3 en caché. El hash incluye modelo y voz: cambiar cualquiera de
 * los dos invalida la caché sin borrar nada a mano.
 */
function cachePathFor(dir: string, voice: TtsVoice, text: string): string {
  const hash = createHash('sha256')
    .update(`${TTS_MODEL}|${voiceIdFor(voice)}|${text}`)
    .digest('hex')
  return join(dir, `${hash}.mp3`)
}

export interface SpeechRequest {
  text: string
  voice: TtsVoice
  /** Sólo para tests: aísla la caché en un directorio temporal. */
  cacheDir?: string
}

export interface Speech {
  audio: Buffer
  /** true si se sirvió de la caché sin llamar al proveedor. */
  cached: boolean
}

/** Devuelve el MP3 de `text` con `voice`, sintetizándolo sólo si no está en caché. */
export async function getSpeech({ text, voice, cacheDir }: SpeechRequest): Promise<Speech> {
  const clean = text.trim()
  if (!clean) throw new HttpError(400, 'Texto vacío')
  if (clean.length > MAX_TEXT_LENGTH) {
    throw new HttpError(400, `Texto demasiado largo (máximo ${MAX_TEXT_LENGTH} caracteres)`)
  }

  const dir = cacheDir ?? env.ttsCacheDir
  const path = cachePathFor(dir, voice, clean)

  try {
    return { audio: await readFile(path), cached: true }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
  }

  const audio = await synthesizeSpeech({ text: clean, voiceId: voiceIdFor(voice) })

  await mkdir(dir, { recursive: true })
  const tmp = `${path}.${process.pid}.tmp`
  await writeFile(tmp, audio)
  await rename(tmp, path)

  return { audio, cached: false }
}
