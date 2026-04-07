import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { readDB, writeDB, findBy, generateId } from '@/lib/db'
import { createToken, sessionCookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name, role, cefr_level } = await req.json()
    if (!email || !password || !full_name || !role)
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    if (password.length < 8)
      return NextResponse.json({ error: 'La contraseña debe tener mínimo 8 caracteres' }, { status: 400 })

    const db = readDB()
    if (findBy(db.users, 'email', email.toLowerCase().trim()))
      return NextResponse.json({ error: 'Ya existe una cuenta con este email' }, { status: 409 })

    const password_hash = await bcrypt.hash(password, 12)
    const newUser = {
      id: generateId(),
      email: email.toLowerCase().trim(),
      password_hash,
      role: role as 'student' | 'teacher',
      full_name: full_name.trim(),
      cefr_level: role === 'student' ? (cefr_level ?? 'B1') : null,
      language_preference: 'es' as const,
      created_at: new Date().toISOString(),
    }
    db.users.push(newUser)
    writeDB(db)

    const token = await createToken({ userId: newUser.id, email: newUser.email, role: newUser.role })
    const res = NextResponse.json({
      user: { id: newUser.id, email: newUser.email, role: newUser.role, full_name: newUser.full_name, cefr_level: newUser.cefr_level }
    }, { status: 201 })
    res.cookies.set(sessionCookieOptions(token))
    return res
  } catch (err) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
