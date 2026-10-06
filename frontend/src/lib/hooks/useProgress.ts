/**
 * Progreso gamificado del alumno: XP total, nivel y racha.
 *
 * La zona horaria viaja al backend porque «hoy» decide el XP del día y la
 * racha. El nivel no se guarda: se deriva del XP en el servidor.
 */
import { useEffect, useState } from 'react'
import { readJson } from '@/lib/api'

export interface StudentProgress {
  level: number
  total_xp: number
  level_xp: number
  level_span: number
  xp_to_next: number
  /** Días seguidos con actividad (hoy o ayer como último día). */
  streak: number
  missions_completed: number
  writing_seconds: number
  xp_today: number
}

export function useProgress(studentId: string | undefined): { progress: StudentProgress | null } {
  const [progress, setProgress] = useState<StudentProgress | null>(null)

  useEffect(() => {
    if (!studentId) return
    let cancelled = false
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    fetch(`/api/students/${studentId}/xp?tz=${encodeURIComponent(timezone)}`)
      .then(readJson)
      .then(data => {
        if (!cancelled) setProgress(data?.progress ?? null)
      })
      .catch(() => {
        // Sin progreso la interfaz simplemente no pinta la barra.
      })

    return () => {
      cancelled = true
    }
  }, [studentId])

  return { progress }
}
