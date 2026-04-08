import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { createToken, sessionCookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    
    if (!email || !password) 
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })

    // Buscar usuario por email
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (queryError || !user) 
      return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })

    // Verificar contraseña
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) 
      return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })

    // Crear token JWT
    const token = await createToken({ userId: user.id, email: user.email, role: user.role })
    const res = NextResponse.json({
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        full_name: user.full_name, 
        cefr_level: user.cefr_level 
      }
    })
    
    res.cookies.set(sessionCookieOptions(token))
    return res
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
