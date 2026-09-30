import { NextRequest, NextResponse } from 'next/server'
import { readDB, findById } from '@/lib/db'
import { isAuthFailure, requireTeacher } from '@/lib/session'
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireTeacher(req)
  if (isAuthFailure(session)) return session
  const userId = session.userId
  const db = readDB()
  const group = findById(db.groups, params.id)
  if (!group || group.teacher_id !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(group)
}
