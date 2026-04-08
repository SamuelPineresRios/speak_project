import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { createToken, sessionCookieOptions } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name, role, cefr_level } = await req.json()
    
    if (!email || !password || !full_name || !role)
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    
    if (password.length < 8)
      return NextResponse.json({ error: 'La contraseña debe tener mínimo 8 caracteres' }, { status: 400 })

    // Verificar si el email ya existe
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking email:', checkError)
      return NextResponse.json({ error: 'Error al verificar email', details: checkError.message }, { status: 500 })
    }

    if (existingUsers && existingUsers.length > 0)
      return NextResponse.json({ error: 'Ya existe una cuenta con este email' }, { status: 409 })

    // Hash de la contraseña
    const password_hash = await bcrypt.hash(password, 12)
    
    // Crear nuevo usuario
    const userId = uuidv4()
    const { data: insertedUsers, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email.toLowerCase().trim(),
        password_hash,
        role: role as 'student' | 'teacher',
        full_name: full_name.trim(),
        cefr_level: role === 'student' ? (cefr_level ?? 'B1') : null,
        language_preference: 'es',
        created_at: new Date().toISOString(),
      })
      .select()

    if (insertError) {
      console.error('Error inserting user:', insertError)
      return NextResponse.json({ error: 'Error al registrar el usuario', details: insertError.message }, { status: 500 })
    }

    const newUser = insertedUsers?.[0]
    if (!newUser) {
      return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
    }

    // Crear token JWT
    const token = await createToken({ userId: newUser.id, email: newUser.email, role: newUser.role })
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
    return NextResponse.json({ error: 'Error interno', details: String(err) }, { status: 500 })
  }
}
