import { NextRequest, NextResponse } from 'next/server'
import { readDB, filterBy } from '@/lib/db'
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = readDB()
  const groups = filterBy(db.groups, 'teacher_id', userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return NextResponse.json({ groups })
}
