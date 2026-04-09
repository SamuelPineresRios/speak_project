'use client'

import { useEffect } from 'react'
import { useSessionPersistence, storeLastRoute } from '@/lib/hooks/useSessionPersistence'

/**
 * Component that handles session recovery on app mount
 * Wraps the entire app to manage authentication state
 */
export function SessionRecoveryWrapper({ children }: { children: React.ReactNode }) {
  const { sessionChecked } = useSessionPersistence()

  // Track route changes via History API
  useEffect(() => {
    if (!sessionChecked) return

    // Store initial route
    storeLastRoute(window.location.pathname)

    // Store route on navigation
    const handleNavigation = () => {
      storeLastRoute(window.location.pathname)
    }

    // Listen for browser back/forward
    window.addEventListener('popstate', handleNavigation)

    return () => {
      window.removeEventListener('popstate', handleNavigation)
    }
  }, [sessionChecked])

  // Don't render until session check is complete
  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin"></div>
      </div>
    )
  }

  return <>{children}</>
}
