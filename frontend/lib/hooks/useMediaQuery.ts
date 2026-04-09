'use client'

import { useEffect, useState } from 'react'

// Tailwind breakpoints
const BREAKPOINTS = {
  mobile: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Hook to detect current viewport size and breakpoint
 * Returns true if viewport is at or above the specified breakpoint
 * 
 * @example
 * const isDesktop = useMediaQuery('md') // true if >= 768px
 * const isMobile = !useMediaQuery('md') // true if < 768px
 */
export function useMediaQuery(minBreakpoint: Breakpoint = 'md'): boolean {
  const [isMatch, setIsMatch] = useState(false)

  useEffect(() => {
    // Set initial state
    const minWidth = BREAKPOINTS[minBreakpoint]
    setIsMatch(window.innerWidth >= minWidth)

    // Create media query
    const mediaQuery = window.matchMedia(`(min-width: ${minWidth}px)`)
    
    // Handler for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMatch(e.matches)
    }

    // Add listener
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [minBreakpoint])

  return isMatch
}

/**
 * Hook to get current breakpoint name
 * Useful for more detailed responsive logic
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('mobile')

  useEffect(() => {
    // Function to determine current breakpoint
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width >= BREAKPOINTS['2xl']) setBreakpoint('2xl')
      else if (width >= BREAKPOINTS.xl) setBreakpoint('xl')
      else if (width >= BREAKPOINTS.lg) setBreakpoint('lg')
      else if (width >= BREAKPOINTS.md) setBreakpoint('md')
      else if (width >= BREAKPOINTS.sm) setBreakpoint('sm')
      else setBreakpoint('mobile')
    }

    // Set initial state
    updateBreakpoint()

    // Add resize listener
    window.addEventListener('resize', updateBreakpoint)

    return () => {
      window.removeEventListener('resize', updateBreakpoint)
    }
  }, [])

  return breakpoint
}

/**
 * Simple hook: true if mobile (< md breakpoint), false if desktop
 */
export function useIsMobile(): boolean {
  return !useMediaQuery('md')
}

/**
 * Simple hook: true if desktop (>= md breakpoint), false if mobile
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('md')
}
