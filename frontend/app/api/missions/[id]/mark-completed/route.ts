import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB, generateId, type NarrativeState } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { group_id } = await req.json().catch(() => ({}))
    const db = readDB()
    const existingStateIdx = db.narrative_states.findIndex(n => n.student_id === userId && n.mission_id === params.id)
    const state: NarrativeState = {
      id: existingStateIdx >= 0 ? db.narrative_states[existingStateIdx].id : generateId(),
      student_id: userId,
      mission_id: params.id,
      group_id: group_id ?? null,
      state: 'completed',
      character_reaction: 'positive',
      scene_position: 1,
      updated_at: new Date().toISOString(),
    }
    if (existingStateIdx >= 0) db.narrative_states[existingStateIdx] = state
    else db.narrative_states.push(state)

    // Optionally update weekly aggregates minimal entry if needed (skip complex updates here)
    writeDB(db)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[MarkCompleted]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
