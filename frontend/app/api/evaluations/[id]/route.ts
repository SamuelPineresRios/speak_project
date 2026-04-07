import { NextRequest, NextResponse } from 'next/server'
import { readDB, findById } from '@/lib/db'
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = readDB()
  const evaluation = findById(db.evaluations, params.id)
  if (!evaluation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // Verify ownership via response
  const response = findById(db.responses, evaluation.response_id)
  if (!response || response.student_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json({ evaluation })
}
