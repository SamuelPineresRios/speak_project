import { NextRequest, NextResponse } from 'next/server'
import { readDB, findById } from '@/lib/db'
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = readDB()
  const group = findById(db.groups, params.id)
  if (!group || group.teacher_id !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(group)
}
