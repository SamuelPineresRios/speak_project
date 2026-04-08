import { NextRequest, NextResponse } from 'next/server'
import { readDB, findById } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    
    if (!userId) {
      // Return a default student user for testing
      console.log('[Auth ME] No userId, returning default user')
      return NextResponse.json({ 
        user: {
          id: 'default-student-001',
          email: 'student@test.com',
          role: 'student',
          full_name: 'Test Student',
          cefr_level: 'B1'
        }
      })
    }

    const db = readDB()
    const user = findById(db.users, userId)
    
    if (!user) {
      // Return default if user not in local DB
      return NextResponse.json({ 
        user: {
          id: userId,
          email: 'user@test.com',
          role: 'student',
          full_name: 'User',
          cefr_level: 'B1'
        }
      })
    }

    const { password_hash, ...safe } = user
    return NextResponse.json({ user: safe })
  } catch (e) {
    console.error('[Auth ME] Error:', e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
