/**
 * Sesión JWT firmada con `jose` y transportada en una cookie HttpOnly.
 *
 * No hay servicio externo de autenticación: la cookie es la única prueba de
 * identidad y el backend la verifica en cada petición.
 */
import { SignJWT, jwtVerify } from 'jose'
import type { CookieOptions } from 'express'
import type { SessionPayload } from '@vox/shared'
import { env } from '../config/env.ts'

export const SESSION_COOKIE_NAME = 'speak_session'

const SECRET = new TextEncoder().encode(env.jwtSecret)
const EXPIRES_IN = '7d'
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

/**
 * Opciones de la cookie de sesión.
 *
 * Ojo con `maxAge`: Express lo interpreta en MILISEGUNDOS, mientras que el
 * `cookies.set()` de Next.js lo interpretaba en segundos. Este desajuste
 * dejaba sesiones de 10 minutos en lugar de 7 días.
 */
export function sessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    maxAge: SEVEN_DAYS_MS,
    path: '/',
  }
}

export function clearCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/',
  }
}
