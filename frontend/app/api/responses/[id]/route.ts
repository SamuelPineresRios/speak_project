import { NextRequest, NextResponse } from 'next/server'
import { readDB, findById } from '@/lib/db'
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = readDB()
  const response = findById(db.responses, params.id)
  if (!response) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (response.student_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json({ response })
}
