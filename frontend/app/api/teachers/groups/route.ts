import { NextRequest, NextResponse } from 'next/server'
import { readDB, filterBy } from '@/lib/db'
import { isAuthFailure, requireTeacher } from '@/lib/session'
export async function GET(req: NextRequest) {
  const session = await requireTeacher(req)
  if (isAuthFailure(session)) return session
  const userId = session.userId
  const db = readDB()
  const groups = filterBy(db.groups, 'teacher_id', userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return NextResponse.json({ groups })
}
