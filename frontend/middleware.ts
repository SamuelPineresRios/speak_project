import { NextResponse, type NextRequest } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/signup', '/api/auth/login', '/api/auth/signup']
const TEACHER_PATHS = ['/dashboard', '/group/', '/api/teachers', '/group/create']
const STUDENT_PATHS = ['/missions', '/missiones', '/mission/', '/mission/', '/feedback', '/session-summary', '/join-group', '/groups', '/squads', '/stories', '/story', '/guides', '/profile']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Always allow public paths
  if (PUBLIC_PATHS.some(p => path.startsWith(p))) return NextResponse.next()
  if (path === '/') return NextResponse.next()

  // Require auth for protected app pages and API routes (except auth)
  const isProtected = path.startsWith('/api/') || TEACHER_PATHS.some(p => path.startsWith(p)) || STUDENT_PATHS.some(p => path.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const session = await getSessionFromRequest(request)

  // Not authenticated → redirect to login
  if (!session) {
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Teacher-only routes
  if (TEACHER_PATHS.some(p => path.startsWith(p)) && session.role !== 'teacher') {
    if (path.startsWith('/api/')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.redirect(new URL('/missions', request.url))
  }

  // Add user info to headers for API routes
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', session.userId)
  requestHeaders.set('x-user-role', session.role)
  requestHeaders.set('x-user-email', session.email)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons).*)'],
}
