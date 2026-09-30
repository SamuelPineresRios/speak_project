/**
 * Códigos de acceso a grupo.
 *
 * El alfabeto omite caracteres ambiguos (0/O, 1/I/L) porque el código se dicta
 * en voz alta en clase. Se genera con `crypto.randomInt` en lugar de
 * `Math.random`: el código es la única credencial para unirse a un grupo.
 */
import { randomInt } from 'node:crypto'

const ACCESS_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateAccessCode(length = 7): string {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += ACCESS_CODE_CHARS.charAt(randomInt(ACCESS_CODE_CHARS.length))
  }
  return code
}
