import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/postgres'
import { missions } from '@/lib/schema'
import { isAuthFailure, requireUser } from '@/lib/session'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireUser(req)
    if (isAuthFailure(session)) return session

    const missionId = params.id

    const [mission] = await getDb()
      .select()
      .from(missions)
      .where(eq(missions.id, missionId))
      .limit(1)

    if (!mission) {
      console.log('[Mission GET] Mission not found:', missionId)
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    console.log('[Mission GET] Found mission:', mission.title)
    const response = NextResponse.json({ mission, narrative_state: null })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (e) {
    console.error('[Mission GET] Exception:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
