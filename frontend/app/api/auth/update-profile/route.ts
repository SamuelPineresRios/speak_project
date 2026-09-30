import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/postgres'
import { users } from '@/lib/schema'
import { isAuthFailure, requireUser } from '@/lib/session'

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireUser(req)
    if (isAuthFailure(session)) return session

    const { full_name } = await req.json()

    if (!full_name || full_name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const [user] = await getDb()
      .update(users)
      .set({ full_name: full_name.trim() })
      .where(eq(users.id, session.userId))
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
        full_name: users.full_name,
        cefr_level: users.cefr_level,
      })

    if (!user) {
      console.log('[Update Profile] User not found:', session.userId)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ user })
  } catch (e) {
    console.error('[Update Profile] Error:', e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
