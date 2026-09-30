import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/postgres'
import { users, type CefrLevel, type UserRole } from '@/lib/schema'
import { createToken, sessionCookieOptions } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

const VALID_CEFR: CefrLevel[] = ['A1', 'A2', 'B1', 'B2']

/** Código Postgres para violación de clave única. */
const UNIQUE_VIOLATION = '23505'

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name, role, cefr_level } = await req.json()

    if (!email || !password || !full_name || !role)
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })

    if (password.length < 8)
      return NextResponse.json({ error: 'La contraseña debe tener mínimo 8 caracteres' }, { status: 400 })

    // El rol y el nivel CEFR llegan del cliente: se validan aquí para que no
    // se persistan valores arbitrarios en la base de datos.
    if (role !== 'student' && role !== 'teacher')
      return NextResponse.json({ error: 'Rol no válido' }, { status: 400 })

    if (cefr_level !== undefined && cefr_level !== null && !VALID_CEFR.includes(cefr_level))
      return NextResponse.json({ error: 'Nivel CEFR no válido' }, { status: 400 })

    const normalizedEmail = email.toLowerCase().trim()

    const [existing] = await getDb()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1)

    if (existing)
      return NextResponse.json({ error: 'Ya existe una cuenta con este email' }, { status: 409 })

    const password_hash = await bcrypt.hash(password, 12)

    let newUser: typeof users.$inferSelect
    try {
      ;[newUser] = await getDb()
        .insert(users)
        .values({
          id: uuidv4(),
          email: normalizedEmail,
          password_hash,
          role: role as UserRole,
          full_name: full_name.trim(),
          cefr_level: role === 'student' ? ((cefr_level ?? 'B1') as CefrLevel) : null,
          language_preference: 'es',
          created_at: new Date(),
        })
        .returning()
    } catch (err) {
      // Carrera entre la comprobación y el INSERT: la restricción única de la
      // columna email es la garantía real contra cuentas duplicadas.
      if ((err as { code?: string })?.code === UNIQUE_VIOLATION) {
        return NextResponse.json({ error: 'Ya existe una cuenta con este email' }, { status: 409 })
      }
      console.error('Error inserting user:', err)
      return NextResponse.json({ error: 'Error al registrar el usuario' }, { status: 500 })
    }

    const token = await createToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    })
    const res = NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        full_name: newUser.full_name,
        cefr_level: newUser.cefr_level
      }
    }, { status: 201 })

    res.cookies.set(sessionCookieOptions(token))
    return res
  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
