import { NextRequest, NextResponse } from 'next/server'
import { eq, inArray } from 'drizzle-orm'
import { readDB, writeDB, findById, generateId } from '@/lib/db'
import { getDb } from '@/lib/postgres'
import { missions } from '@/lib/schema'
import { forbidden, isAuthFailure, requireTeacher } from '@/lib/session'
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireTeacher(req)
  if (isAuthFailure(session)) return session
  const userId = session.userId
  const db = readDB()
  const group = findById(db.groups, params.id)
  if (!group || group.teacher_id !== userId) return forbidden()
  const { mission_id, due_date } = await req.json()
  if (!mission_id) return NextResponse.json({ error: 'mission_id required' }, { status: 400 })

  // Sin esta comprobación la asignación quedaba como un apuntador a una misión
  // inexistente y el profesor veía "Desconocida" sin poder corregirlo.
  const [mission] = await getDb()
    .select({ id: missions.id })
    .from(missions)
    .where(eq(missions.id, mission_id))
    .limit(1)
  if (!mission) return NextResponse.json({ error: 'Mission not found' }, { status: 404 })

  const assignment = { id: generateId(), group_id: params.id, mission_id, assigned_by: userId, due_date: due_date ?? null, created_at: new Date().toISOString() }
  db.mission_assignments.push(assignment)
  writeDB(db)
  return NextResponse.json(assignment, { status: 201 })
}
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireTeacher(req)
  if (isAuthFailure(session)) return session
  const userId = session.userId
  const db = readDB()
  const group = findById(db.groups, params.id)
  if (!group || group.teacher_id !== userId) return forbidden()
  const groupAssignments = db.mission_assignments.filter(a => a.group_id === params.id)
  const missionIds = [...new Set(groupAssignments.map(a => a.mission_id))]
  const missionRows = missionIds.length > 0
    ? await getDb().select().from(missions).where(inArray(missions.id, missionIds))
    : []
  const missionById = new Map(missionRows.map(m => [m.id, m]))
  const assignments = groupAssignments
    .map(a => ({ ...a, mission: missionById.get(a.mission_id) }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return NextResponse.json({ assignments })
}
