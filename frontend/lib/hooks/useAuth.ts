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
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (typeof window === 'undefined') {
          setLoading(false)
          return
        }

        const userId = localStorage.getItem('userId')
        
        if (!userId) {
          setLoading(false)
          return
        }
        
        const res = await fetch('/api/auth/me', { 
          headers: { 'x-user-id': userId }
        })

        if (res.ok) {
          const data = await res.json()
          console.log('✅ User loaded from API:', data.user)
          setUser(data.user)
        } else {
          console.log('❌ API response not OK:', res.status)
          localStorage.removeItem('userId')
        }
      } catch (e) {
        console.error('[Auth] Error:', e)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const logout = useCallback(async () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('speak:last-route')
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
    router.push('/login')
  }, [router])

  return { user, loading, logout, refetch: async () => {
    const userId = localStorage.getItem('userId')
    if (!userId) return
    
    const res = await fetch('/api/auth/me', { 
      headers: { 'x-user-id': userId }
    })
    if (res.ok) {
      const data = await res.json()
      setUser(data.user)
    }
  } }
}
