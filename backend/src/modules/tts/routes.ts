/**
 * Ruta HTTP del texto a voz (montada en `/api/tts`).
 *
 * GET /api/tts?text=...&voice=a|b -> audio/mpeg
 *
 * El audio se sirve con caché de un año: mismo texto y voz dan siempre el
 * mismo MP3, así que el navegador no vuelve a pedirlo. La caché del servidor
 * evita además pagar dos veces al proveedor por la misma frase.
 */
import { Router } from 'express'
import { env } from '../../config/env.ts'
import { TTSProviderError } from '../../lib/elevenlabs.ts'
import { requireAuth } from '../../middleware/require-auth.ts'
import { getSpeech, normalizeVoice } from './service.ts'

export const ttsRouter = Router()

/**
 * Estado del servicio: el frontend lo consulta una vez por sesión para no
 * pedir audio cuando no hay clave (ni llenar la consola de 503). No sintetiza.
 */
ttsRouter.get('/status', requireAuth, (_req, res) => {
  res.json({ configured: Boolean(env.elevenLabsApiKey) })
})

ttsRouter.get('/', requireAuth, async (req, res) => {
  const text = typeof req.query.text === 'string' ? req.query.text : ''
  const voice = normalizeVoice(req.query.voice)

  try {
    const { audio, cached } = await getSpeech({ text, voice })

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'private, max-age=31536000, immutable')
    res.setHeader('X-TTS-Cache', cached ? 'hit' : 'miss')
    res.send(audio)
  } catch (err) {
    if (err instanceof TTSProviderError) {
      // El status del proveedor (401 por clave o cuota, 402 por voz de pago...)
      // no se propaga tal cual: no significan lo mismo que en esta API.
      console.error('[tts] Error del proveedor de voz:', err.status, err.detail)
      res.status(502).json({ error: 'Error del proveedor de voz' })
      return
    }
    throw err
  }
})
