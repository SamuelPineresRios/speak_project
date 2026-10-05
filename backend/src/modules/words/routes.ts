/**
 * Rutas del vocabulario (montadas en `/api/words`).
 *
 * - POST /lookup     -> ficha de una palabra (hover de la escena y el chat)
 * - POST /            -> guarda la palabra en el vocabulario del alumno
 * - GET  /            -> vocabulario completo, con fichas
 * - DELETE /:id       -> quita una palabra propia
 */
import { Router } from 'express'
import { requireAuth, sessionOf } from '../../middleware/require-auth.ts'
import { routeParam } from '../../utils/route-params.ts'
import { deleteSavedWord, listSavedWords, lookupWord, saveWord } from './service.ts'

export const wordsRouter = Router()

wordsRouter.post('/lookup', requireAuth, async (req, res) => {
  const session = sessionOf(req)
  const card = await lookupWord(session.userId, req.body?.word, req.body?.context)
  res.json({ card })
})

wordsRouter.post('/', requireAuth, async (req, res) => {
  const session = sessionOf(req)
  const card = await saveWord(session.userId, req.body?.word, req.body?.context)
  res.status(201).json({ card })
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
