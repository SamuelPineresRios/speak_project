'use client'
import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface TimerProps {
  durationSeconds: number
  onTimeout?: () => void
  className?: string
}

export function Timer({ durationSeconds, onTimeout, className }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const [hasStarted, setHasStarted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onTimeoutRef = useRef(onTimeout)
  onTimeoutRef.current = onTimeout

  const percentage = (timeLeft / durationSeconds) * 100
  const isWarning = percentage <= 30
  const isCritical = percentage <= 10

  useEffect(() => {
    setHasStarted(true)
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          onTimeoutRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [])

  return (
    <div className={cn('w-full', className)}>
      {/* Thin bar - peripheral, not center of attention */}
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-linear',
            isCritical
              ? 'bg-coral shadow-[0_0_8px_rgba(248,113,113,0.5)]'
              : isWarning
              ? 'bg-amber shadow-[0_0_6px_rgba(245,158,11,0.4)]'
              : 'bg-emerald/70'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
