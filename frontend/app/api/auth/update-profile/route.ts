import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { full_name } = await req.json()

    if (!full_name || full_name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Update Profile] Missing Supabase credentials')
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Update user in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .update({ full_name: full_name.trim() })
      .eq('id', userId)
      .select('id, email, role, full_name, cefr_level')
      .single()

    if (error || !user) {
      console.log('[Update Profile] Error updating user:', error?.message)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ user })
  } catch (e) {
    console.error('[Update Profile] Error:', e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
