'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

export interface AuthUser {
  id: string
  email: string
  role: 'student' | 'teacher'
  full_name: string | null
  cefr_level: string | null
}

/**
 * The session lives in an HttpOnly cookie, so the identity always comes from
 * the server — never from localStorage.
 */
async function fetchCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch('/api/auth/me')
  if (!res.ok) return null
  const data = await res.json()
  return data.user ?? null
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    fetchCurrentUser()
      .then((nextUser) => { if (!cancelled) setUser(nextUser) })
      .catch((e) => console.error('[Auth] Error:', e))
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  const logout = useCallback(async () => {
    localStorage.removeItem('speak:last-route')
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
    router.push('/login')
  }, [router])

  const refetch = useCallback(async () => {
    setUser(await fetchCurrentUser())
  }, [])

  return { user, loading, logout, refetch }
}
