import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { readDB, findBy } from '@/lib/db'
import { createToken, sessionCookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })

    const db = readDB()
    const user = findBy(db.users, 'email', email.toLowerCase().trim())
    if (!user) return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })

    const token = await createToken({ userId: user.id, email: user.email, role: user.role })
    const res = NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name, cefr_level: user.cefr_level }
    })
    res.cookies.set(sessionCookieOptions(token))
    return res
  } catch (err) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
