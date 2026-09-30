/**
 * Reglas de propiedad de recursos.
 *
 * Se mantiene separado de la autenticación porque se usa dentro de los
 * handlers: un endpoint puede requerir sesión y aun así tener que comprobar
 * que el recurso pertenece al usuario (o que su rol puede verlo).
 */
import type { SessionPayload, UserRole } from '@vox/shared'

/**
 * True cuando la sesión puede leer un registro cuyo dueño es `ownerId`.
 * El dueño siempre pasa; otros roles deben estar listados en `allowedRoles`.
 */
export function ownsResource(
  session: SessionPayload,
  ownerId: string | null | undefined,
  allowedRoles: UserRole[] = [],
): boolean {
  if (session.userId === ownerId) return true
  return allowedRoles.includes(session.role)
}
