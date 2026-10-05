/**
 * Pronunciación libre de palabras: grabaciones humanas de Wikimedia.
 *
 * Coste cero: se busca el audio inglés de la palabra en Wiktionary, se toma el
 * MP3 transcodificado de Wikimedia Commons y se cachea en disco. La primera
 * consulta hace dos llamadas a la API y una descarga; a partir de ahí se sirve
 * del disco. Las palabras sin grabación se recuerdan para no volver a buscar.
 *
 * Sólo tiene sentido para palabras sueltas; las frases de la escena siguen
 * usando el TTS del backend.
 */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { env } from '../../config/env.ts'
import { HttpError } from '../../utils/http-error.ts'
import { normalizeWord } from './service.ts'

const WIKTIONARY_API = 'https://en.wiktionary.org/w/api.php'
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php'
const REQUEST_TIMEOUT_MS = 15_000
/** Wikimedia bloquea peticiones sin identificación. */
const USER_AGENT = 'Letoura/1.0 (app de aprendizaje de inglés)'

export interface Pronunciation {
  audio: Buffer
  contentType: string
  /** true si venía de la caché en disco. */
  cached: boolean
}

/**
 * Puntos de un fichero de audio según lo «inglés» que sea. Se prefiere
 * inglés americano; los ficheros de Lingua Libre de inglés llevan el Q1860.
 */
function englishScore(file: string): number {
  const name = file.replace(/^File:/i, '').toLowerCase()
  if (name.startsWith('en-us-')) return 100
  if (name.startsWith('en-uk-') || name.startsWith('en-gb-')) return 90
  if (/^en-(au|ca|ie|nz|za|in)-/.test(name)) return 80
  if (name.startsWith('en-')) return 70
  if (name.startsWith('ll-q1860 (eng)-')) return 60
  return 0
}

/** Extensión y tipo de contenido a partir de la URL del fichero. */
function formatFor(url: string): { ext: string; contentType: string } {
  if (/\.wav(\?|$)/i.test(url)) return { ext: 'wav', contentType: 'audio/wav' }
  if (/\.(ogg|oga)(\?|$)/i.test(url)) return { ext: 'ogg', contentType: 'audio/ogg' }
  return { ext: 'mp3', contentType: 'audio/mpeg' }
}

/** Forma mínima de las respuestas de la API de MediaWiki que usamos. */
interface WikimediaImage {
  title?: string
}
interface WikimediaDerivative {
  transcodekey?: string
  src?: string
}
interface WikimediaPage {
  images?: WikimediaImage[]
  videoinfo?: Array<{ derivatives?: WikimediaDerivative[] }>
}
interface WikimediaResponse {
  query?: { pages?: Record<string, WikimediaPage> }
}

async function fetchJson(url: string): Promise<WikimediaResponse> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Wikimedia respondió ${response.status}`)
  return (await response.json()) as WikimediaResponse
}

/** Páginas de una respuesta de la API (la forma `query.pages`). */
function pagesOf(data: WikimediaResponse): WikimediaPage[] {
  return Object.values(data.query?.pages ?? {})
}

/**
 * Busca la mejor grabación inglesa de `word`; null si no hay ninguna.
 * Devuelve la URL del MP3 transcodificado (o el original si no hay transcode).
 */
async function findWikimediaAudio(word: string): Promise<string | null> {
  const images = await fetchJson(
    `${WIKTIONARY_API}?action=query&titles=${encodeURIComponent(word)}&prop=images&imlimit=200&format=json&origin=*`,
  )
  const files = pagesOf(images)
    .flatMap(page => page.images ?? [])
    .map(image => String(image.title ?? ''))
    .filter(title => /\.(ogg|oga|wav|mp3|flac)$/i.test(title))

  let best: string | null = null
  let bestScore = 0
  for (const file of files) {
    const score = englishScore(file)
    if (score > bestScore) {
      best = file
      bestScore = score
    }
  }
  if (!best) return null

  const info = await fetchJson(
    `${COMMONS_API}?action=query&titles=${encodeURIComponent(best)}&prop=videoinfo&viprop=derivatives&format=json&origin=*`,
  )
  const derivatives = pagesOf(info).flatMap(page =>
    (page.videoinfo ?? []).flatMap(video => video.derivatives ?? []),
  )
  const mp3 = derivatives.find(derivative => derivative.transcodekey === 'mp3')?.src
  const original = derivatives.find(derivative => !derivative.transcodekey)?.src
  return typeof mp3 === 'string' ? mp3 : typeof original === 'string' ? original : null
}

function cachePath(word: string, ext: string): string {
  return join(env.pronunciationCacheDir, `${word.replace(/[^a-z0-9'-]/gi, '_')}.${ext}`)
}

/** Marcador de «esta palabra no tiene grabación», para no repetir la búsqueda. */
function missingPath(word: string): string {
  return join(env.pronunciationCacheDir, `${word.replace(/[^a-z0-9'-]/gi, '_')}.none`)
}

async function readIfExists(path: string): Promise<Buffer | null> {
  try {
    return await readFile(path)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw err
  }
}

/**
 * Pronunciación de una palabra (Buffer) o null si no hay grabación.
 * Lanza 400 si la palabra no es válida.
 */
export async function getPronunciation(rawWord: unknown): Promise<Pronunciation | null> {
  const word = normalizeWord(typeof rawWord === 'string' ? rawWord : '')
  if (!word || word.length > 64) throw new HttpError(400, 'Palabra no válida')

  // Caché en disco (mp3 casi siempre; ogg/wav si no hubo transcode).
  for (const ext of ['mp3', 'ogg', 'wav']) {
    const audio = await readIfExists(cachePath(word, ext))
    if (audio) {
      const contentType = ext === 'mp3' ? 'audio/mpeg' : ext === 'ogg' ? 'audio/ogg' : 'audio/wav'
      return { audio, contentType, cached: true }
    }
  }

  // Sin grabación conocida: 404 sin volver a salir a la red.
  if (await readIfExists(missingPath(word))) return null

  let url: string | null
  try {
    url = await findWikimediaAudio(word)
  } catch (err) {
    // Si Wikimedia falla, no se marca como «sin audio»: mañana puede estar.
    console.error('[pronunciation] No se pudo buscar la grabación:', word, err)
    return null
  }

  if (!url) {
    await mkdir(env.pronunciationCacheDir, { recursive: true })
    await writeFile(missingPath(word), '')
    return null
  }

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) {
    console.error('[pronunciation] No se pudo descargar la grabación:', response.status)
    return null
  }
  const audio = Buffer.from(await response.arrayBuffer())
  if (audio.length === 0) return null

  const { ext, contentType } = formatFor(url)
  const path = cachePath(word, ext)
  await mkdir(dirname(path), { recursive: true })
  const tmp = `${path}.${process.pid}.tmp`
  await writeFile(tmp, audio)
  await rename(tmp, path)

  return { audio, contentType, cached: false }
}
