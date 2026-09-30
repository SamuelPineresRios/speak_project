/**
 * Contrato de sesión compartido por backend y frontend.
 *
 * Fuente única de verdad del payload que viaja firmado en la cookie
 * `speak_session` y del rol que determina la autorización.
 */
export type UserRole = 'student' | 'teacher'

export interface SessionPayload {
  userId: string
  email: string
  role: UserRole
}
