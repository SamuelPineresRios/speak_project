/**
 * Lectura de respuestas de la API.
 *
 * `res.json()` lanza `Unexpected end of JSON input` cuando el cuerpo viene
 * vacío. Eso pasa de verdad: si el backend está caído o reiniciándose
 * (`node --watch`), el proxy de Vite responde 502 **sin cuerpo**, y el
 * TypeError acababa pintado en la interfaz como si fuera un mensaje del
 * servidor.
 *
 * `readJson` nunca lanza: devuelve `null` y lo deja registrado en consola.
 */
export async function readJson<T = any>(response: Response): Promise<T | null> {
  let text: string
  try {
    text = await response.text()
  } catch (error) {
    console.error('[api] No se pudo leer el cuerpo de la respuesta:', error)
    return null
  }

  // Respuestas sin cuerpo (204, 304 o un corte del proxy) no son JSON válido.
  if (!text) return null

  try {
    return JSON.parse(text) as T
  } catch {
    console.error('[api] Respuesta no-JSON:', response.status, text.slice(0, 200))
    return null
  }
}
