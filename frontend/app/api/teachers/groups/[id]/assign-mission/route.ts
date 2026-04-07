import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB, findById, generateId } from '@/lib/db'
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = readDB()
  const group = findById(db.groups, params.id)
  if (!group || group.teacher_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { mission_id, due_date } = await req.json()
  if (!mission_id) return NextResponse.json({ error: 'mission_id required' }, { status: 400 })
  const assignment = { id: generateId(), group_id: params.id, mission_id, assigned_by: userId, due_date: due_date ?? null, created_at: new Date().toISOString() }
  db.mission_assignments.push(assignment)
  writeDB(db)
  return NextResponse.json(assignment, { status: 201 })
}
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = readDB()
  const group = findById(db.groups, params.id)
  if (!group || group.teacher_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const assignments = db.mission_assignments
    .filter(a => a.group_id === params.id)
    .map(a => ({ ...a, mission: findById(db.missions, a.mission_id) }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return NextResponse.json({ assignments })
}
