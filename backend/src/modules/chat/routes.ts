/**
 * Ruta HTTP del modo conversación (montada en `/api/chat`).
 *
 * No toca la base de datos: sólo compone el prompt a partir del contexto que
 * envía el cliente y lo pasa al proveedor de IA.
 */
import { Router } from 'express'
import { AIProviderError } from '../../lib/ai.ts'
import { requireAuth } from '../../middleware/require-auth.ts'
import type { MissionContext } from './prompts.ts'
import { requestHints, requestRoleplayTurn } from './service.ts'

export const chatRouter = Router()

/** Contexto de misión con valores por defecto: nunca interpola `undefined`. */
function readMission(value: unknown): MissionContext {
  const mission = (value ?? {}) as Record<string, unknown>
  return {
    character_name:
      typeof mission.character_name === 'string' ? mission.character_name : 'Assistant',
    objective: typeof mission.objective === 'string' ? mission.objective : '',
    scene_context: typeof mission.scene_context === 'string' ? mission.scene_context : '',
  }
}

chatRouter.post('/', requireAuth, async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>
  const mission = readMission(body.mission)
  const userLevel = typeof body.userLevel === 'string' ? body.userLevel : 'A2'
  const mode = typeof body.mode === 'string' ? body.mode : 'chat'

  if (mode === 'hints') {
    const lastMessage = typeof body.lastMessage === 'string' ? body.lastMessage : ''
    res.json(await requestHints({ lastMessage, mission, userLevel }))
    return
  }

  try {
    res.json(await requestRoleplayTurn({ rawMessages: body.messages, mission, userLevel }))
  } catch (err) {
    if (err instanceof AIProviderError) {
      // El status del proveedor (401 por clave inválida, 429 por límite...) no
      // se propaga tal cual: un 401 de Anthropic no significa que la sesión
      // del alumno haya caducado. Se registra y se responde 502.
      console.error('[chat] Error del proveedor de IA:', err.status, err.detail)
      res.status(502).json({ error: 'Error del proveedor de IA' })
      return
    }
    throw err
  }
})
