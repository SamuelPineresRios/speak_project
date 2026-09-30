/**
 * Authorisation helpers for API routes.
 *
 * `middleware.ts` already rejects unauthenticated requests and gates the
 * teacher-only pages, but every API route re-validates the JWT cookie here so
 * a middleware regression can never turn into an IDOR.
 *
 * The helpers return either the session or an already-built `NextResponse`
 * with the right status, so they can be used both inside and outside a
 * `try/catch` without turning a 401 into a 500:
 *
 *   const session = await requireUser(request)
 *   if (isAuthFailure(session)) return session
 */
import { NextRequest, NextResponse } from 'next/server'
import { SessionPayload, getSessionFromRequest } from './auth'

export type SessionResult = SessionPayload | NextResponse

export function isAuthFailure(result: SessionResult): result is NextResponse {
  return result instanceof NextResponse
}

function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

/** Returns a ready-made 403 response. */
export function forbidden(): NextResponse {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

/** Returns the authenticated session, or a 401 response. */
export async function requireUser(request: NextRequest): Promise<SessionResult> {
  const session = await getSessionFromRequest(request)
  return session ?? unauthorized()
}

/** Returns the session when it belongs to a teacher, or a 401/403 response. */
export async function requireTeacher(request: NextRequest): Promise<SessionResult> {
  const session = await getSessionFromRequest(request)
  if (!session) return unauthorized()
  return session.role === 'teacher' ? session : forbidden()
}

/**
 * True when the session may read a record owned by `ownerId`.
 * Owners always pass; other roles must be listed in `allowedRoles`.
 */
export function ownsResource(
  session: SessionPayload,
  ownerId: string | null | undefined,
  allowedRoles: SessionPayload['role'][] = [],
): boolean {
  if (session.userId === ownerId) return true
  return allowedRoles.includes(session.role)
}
