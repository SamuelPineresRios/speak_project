import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB, findBy, generateId } from '@/lib/db'
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { access_code } = await req.json()
  if (!access_code?.trim()) return NextResponse.json({ error: 'access_code required' }, { status: 400 })
  const db = readDB()
  const group = findBy(db.groups, 'access_code', access_code.trim().toUpperCase())
  if (!group) return NextResponse.json({ error: 'Código inválido' }, { status: 404 })
  const existing = db.group_members.find(m => m.group_id === group.id && m.student_id === userId)
  if (existing) return NextResponse.json({ group_id: group.id, name: group.name, already_member: true })
  db.group_members.push({ id: generateId(), group_id: group.id, student_id: userId, joined_at: new Date().toISOString() })
  writeDB(db)
  return NextResponse.json({ group_id: group.id, name: group.name, joined: true }, { status: 201 })
}
