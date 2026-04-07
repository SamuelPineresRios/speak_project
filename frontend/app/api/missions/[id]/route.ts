import { NextRequest, NextResponse } from 'next/server'
import { readDB, findById, filterBy } from '@/lib/db'
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = readDB()
  const mission = findById(db.missions, params.id)
  if (!mission) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const narrativeState = db.narrative_states.find(n => n.student_id === userId && n.mission_id === params.id) ?? null
  return NextResponse.json({ mission, narrative_state: narrativeState })
}
