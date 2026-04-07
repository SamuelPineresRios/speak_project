import { NextRequest, NextResponse } from 'next/server'
import { readDB, getWeekStart } from '@/lib/db'

function generateSuggestion(topStructures: { structure: string; count: number }[]): string {
  if (!topStructures.length) return 'Completa tu primera misión para recibir sugerencias personalizadas.'
  const top = topStructures[0]
  const map: Record<string, string> = {
    'present simple': `Usaste "${top.structure}" ${top.count} veces. En la próxima misión, combínalo con adverbios de frecuencia: "I usually...", "I often..."`,
    'present perfect': `¡Excelente! Usaste "${top.structure}" ${top.count} veces. Practica usarlo para experiencias: "Have you ever...?"`,
    'past simple': `Usaste "${top.structure}" con confianza. Intenta narrar secuencias: "first... then... finally..."`,
    'modal verbs': `Usaste modales ${top.count} veces. Si usaste "can", prueba "could" para sonar más formal.`,
  }
  const key = Object.keys(map).find(k => top.structure.toLowerCase().includes(k))
  return key ? map[key] : `Esta semana usaste "${top.structure}" ${top.count} veces. ¡Sigue practicándolo en la próxima sesión!`
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id')
  const role = req.headers.get('x-user-role')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (userId !== params.id && role !== 'teacher') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const weekOffset = parseInt(req.nextUrl.searchParams.get('week_offset') ?? '0')
  const db = readDB()

  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() - weekOffset * 7)
  const weekStartDate = getWeekStart(targetDate)

  const weekly = db.weekly_aggregates.find(a => a.student_id === params.id && a.week_start_date === weekStartDate)

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todaySeconds = db.responses
    .filter(r => r.student_id === params.id && new Date(r.submitted_at) >= todayStart)
    .reduce((sum, r) => sum + (r.time_taken_seconds ?? 0), 0)

  // Top structures from recent evaluations
  const recentResponseIds = db.responses
    .filter(r => r.student_id === params.id)
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    .slice(0, 20).map(r => r.id)

  const freq: Record<string, number> = {}
  db.evaluations
    .filter(e => recentResponseIds.includes(e.response_id))
    .forEach(e => e.detected_structures.forEach(s => { freq[s] = (freq[s] ?? 0) + 1 }))

  const topStructures = Object.entries(freq)
    .sort(([, a], [, b]) => b - a).slice(0, 3)
    .map(([structure, count]) => ({ structure, count }))

  return NextResponse.json({
    today_writing_seconds: todaySeconds,
    week_writing_seconds: weekly?.total_writing_time_seconds ?? 0,
    missions_completed_this_week: weekly?.missions_completed ?? 0,
    avg_comprehensibility: weekly?.avg_comprehensibility ?? null,
    top_structures: topStructures,
    actionable_suggestion: generateSuggestion(topStructures),
    week_start_date: weekStartDate,
  })
}
