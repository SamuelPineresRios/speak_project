import { NextRequest, NextResponse } from 'next/server'
import { asc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/postgres'
import { missions as missionsTable, narrative_states, users } from '@/lib/schema'
import { isAuthFailure, requireUser } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await requireUser(req)
  if (isAuthFailure(session)) return session
  const userId = session.userId

  try {
    const db = getDb()

    const [userRows, allMissions, states] = await Promise.all([
      db
        .select({ cefr_level: users.cefr_level })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1),
      // Orden por id: estable entre consultas (Postgres no garantiza orden sin ORDER BY).
      db.select().from(missionsTable).orderBy(asc(missionsTable.id)),
      db.select().from(narrative_states).where(eq(narrative_states.student_id, userId)),
    ])

    const cefrLevel = userRows[0]?.cefr_level || 'A1'

    const stateByMission = new Map(states.map((s) => [s.mission_id, s]))

    const missionsWithStatus = allMissions.map((mission) => {
      const narrativeState = stateByMission.get(mission.id)
      return {
        ...mission,
        status: narrativeState?.state === 'completed' ? 'completed' :
                narrativeState?.state === 'paused' ? 'paused' :
                narrativeState ? 'in_progress' : 'not_started',
      }
    })

    const response = NextResponse.json({
      missions: missionsWithStatus,
      cefr_level: cefrLevel,
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (e) {
    console.error('[Missions API] Error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
