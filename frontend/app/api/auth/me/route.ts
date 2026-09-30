import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/postgres'
import { users } from '@/lib/schema'
import { isAuthFailure, requireUser } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req)
    if (isAuthFailure(session)) return session

    const [user] = await getDb()
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        full_name: users.full_name,
        cefr_level: users.cefr_level,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1)

    if (!user) {
      console.log('[Auth ME] User not found:', session.userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (e) {
    console.error('[Auth ME] Error:', e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
