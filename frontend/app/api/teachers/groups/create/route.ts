import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB, generateId } from '@/lib/db'
import { generateAccessCode as genCode } from '@/lib/utils'
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  const role = req.headers.get('x-user-role')
  if (!userId || role !== 'teacher') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, institution_name, parental_consent_confirmed } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 })
  if (!parental_consent_confirmed) return NextResponse.json({ error: 'Consentimiento requerido' }, { status: 400 })

  const db = readDB()
  // Generate unique access code
  let access_code = ''
  for (let i = 0; i < 10; i++) {
    const candidate = genCode()
    if (!db.groups.find(g => g.access_code === candidate)) { access_code = candidate; break }
  }
  if (!access_code) return NextResponse.json({ error: 'Code generation failed' }, { status: 500 })

  const group = {
    id: generateId(), teacher_id: userId, name: name.trim(), access_code,
    institution_name: institution_name?.trim() ?? null, parental_consent_confirmed: true,
    created_at: new Date().toISOString(),
  }
  db.groups.push(group)
  writeDB(db)
  return NextResponse.json(group, { status: 201 })
}
