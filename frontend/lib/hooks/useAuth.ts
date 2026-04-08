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

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>({
    id: 'test-student-001',
    email: 'student@test.com',
    role: 'student',
    full_name: 'Test Student',
    cefr_level: 'B1'
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const isMountedRef = useRef(true)

  useEffect(() => {
    const fetchMe = async () => {
      try {
        if (typeof window === 'undefined') {
          return
        }

        const userId = localStorage.getItem('userId')
        const headers: Record<string, string> = {}
        
        if (userId) {
          console.log('[Auth] Found userId in localStorage:', userId.substring(0, 8))
          headers['x-user-id'] = userId
        } else {
          console.log('[Auth] No userId in localStorage, using default user')
          return
        }
        
        const res = await fetch('/api/auth/me', { headers })
        
        if (!isMountedRef.current) return

        if (res.ok) {
          const data = await res.json()
          console.log('[Auth] User loaded:', data.user.email)
          setUser(data.user)
        } else {
          console.log('[Auth] Failed to fetch user:', res.status)
        }
      } catch (e) {
        console.error('[Auth] Error:', e)
      }
    }

    // Fetch on mount
    fetchMe()

    // Listen for storage changes (login in another tab)
    const handleStorageChange = () => {
      fetchMe()
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const logout = useCallback(async () => {
    localStorage.removeItem('userId')
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setUser({
      id: 'test-student-001',
      email: 'student@test.com',
      role: 'student',
      full_name: 'Test Student',
      cefr_level: 'B1'
    })
    router.push('/login')
  }, [router])

  return { user, loading, logout, refetch: () => {} }
}
