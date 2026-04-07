import { NextRequest, NextResponse } from 'next/server'
import { readDB, filterBy } from '@/lib/db'
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = readDB()
  const user = db.users.find(u => u.id === userId)
  // Only consider global narrative states (not group-assigned) for the main missions list
  const narrativeStates = filterBy(db.narrative_states, 'student_id', userId).filter(n => !n.group_id)
  const stateMap = Object.fromEntries(narrativeStates.map(n => [n.mission_id, n.state]))
  const missions = db.missions.map(m => ({ ...m, status: stateMap[m.id] ?? 'not_started' }))
  return NextResponse.json({ missions, cefr_level: user?.cefr_level ?? null })
}
