import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function generateAccessCode(length = 7): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const CEFR_THRESHOLDS: Record<string, number> = {
  A1: 60, A2: 70, B1: 80, B2: 85,
}

export const CEFR_DURATIONS: Record<string, number> = {
  A1: 180, A2: 150, B1: 120, B2: 90,
}

export function getCEFRLabel(level: string): string {
  const labels: Record<string, string> = {
    A1: 'Principiante', A2: 'Básico', B1: 'Intermedio', B2: 'Intermedio Alto',
  }
  return labels[level] ?? level
}
