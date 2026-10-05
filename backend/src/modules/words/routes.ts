/**
 * Rutas del vocabulario (montadas en `/api/words`).
 *
 * - GET  /pronunciation -> grabación libre de una palabra (Wikimedia)
 * - POST /lookup     -> ficha de una palabra (hover de la escena y el chat)
 * - POST /warm       -> calienta en segundo plano las palabras en pantalla
 * - POST /            -> guarda la palabra en el vocabulario del alumno
 * - GET  /            -> vocabulario completo, con fichas
 * - DELETE /:id       -> quita una palabra propia
 */
import { Router } from 'express'
import { requireAuth, sessionOf } from '../../middleware/require-auth.ts'
import { routeParam } from '../../utils/route-params.ts'
import { getPronunciation } from './pronunciation.ts'
import { deleteSavedWord, listSavedWords, lookupWord, saveWord, warmWords } from './service.ts'

export const wordsRouter = Router()

wordsRouter.post('/lookup', requireAuth, async (req, res) => {
  const session = sessionOf(req)
  const card = await lookupWord(session.userId, req.body?.word, req.body?.context)
  res.json({ card })
})

/**
 * Calentado: responde 202 sin esperar a la IA. El cliente lo llama al mostrar
 * una escena o una respuesta, para que el hover encuentre la ficha hecha.
 */
wordsRouter.post('/warm', requireAuth, async (req, res) => {
  res.status(202).json(await warmWords(req.body?.words))
})

wordsRouter.post('/', requireAuth, async (req, res) => {
  const session = sessionOf(req)
  const card = await saveWord(session.userId, req.body?.word, req.body?.context)
  res.status(201).json({ card })
})

/**
 * Pronunciación libre de una palabra (grabación de Wikimedia, cacheada en
 * disco). Responde 404 cuando no hay grabación para que el cliente pruebe
 * otra voz.
 */
wordsRouter.get('/pronunciation', requireAuth, async (req, res) => {
  const pronunciation = await getPronunciation(req.query.word)
  if (!pronunciation) {
    res.status(404).json({ error: 'Sin pronunciación' })
    return
  }

  res.setHeader('Content-Type', pronunciation.contentType)
  res.setHeader('Cache-Control', 'private, max-age=31536000, immutable')
  res.setHeader('X-Pronunciation-Cache', pronunciation.cached ? 'hit' : 'miss')
  res.send(pronunciation.audio)
})

wordsRouter.get('/', requireAuth, async (req, res) => {
  const session = sessionOf(req)
  res.json({ words: await listSavedWords(session.userId) })
})

wordsRouter.delete('/:id', requireAuth, async (req, res) => {
  const session = sessionOf(req)
  await deleteSavedWord(session.userId, routeParam(req, 'id'))
  res.status(204).end()
})
