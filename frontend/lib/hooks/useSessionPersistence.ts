'use client'

import { useEffect, useState } from 'react'

const LAST_ROUTE_KEY = 'speak:last-route'

/**
 * Store the current route in localStorage for session restoration
 * Called by RouteTracker component to periodically save current pathname
 */
export function storeLastRoute(pathname: string) {
  if (typeof window !== 'undefined' && pathname && pathname !== '/') {
    try {
      localStorage.setItem(LAST_ROUTE_KEY, pathname)
    } catch (e) {
      console.error('[RouteTracker] Failed to store route:', e)
    }
  }
}

/**
 * Retrieve the last stored route (for manual restoration if needed)
 */
export function getLastRoute(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(LAST_ROUTE_KEY)
  } catch (e) {
    console.error('[RouteTracker] Failed to get stored route:', e)
    return null
  }
}

/**
 * Clear the stored route (usually called on logout)
 */
export function clearLastRoute() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(LAST_ROUTE_KEY)
    } catch (e) {
      console.error('[RouteTracker] Failed to clear stored route:', e)
    }
  }
}

/**
 * Hook to get the last stored route (if needed)
 * @returns The last route stored in localStorage, or null
 */
export function useLastRoute(): string | null {
  const [lastRoute, setLastRoute] = useState<string | null>(null)

  useEffect(() => {
    setLastRoute(getLastRoute())
  }, [])

  return lastRoute
}

