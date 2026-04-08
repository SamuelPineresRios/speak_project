import { NextRequest, NextResponse } from 'next/server'
import { readDB, findById } from '@/lib/db'
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = readDB()
  const user = findById(db.users, userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const { password_hash, ...safe } = user
  return NextResponse.json({ user: safe })
}
