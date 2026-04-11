import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readDB, filterBy } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || 'test-student-001'
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('[Missions API] No Supabase credentials')
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get user's CEFR level from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('cefr_level')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.log('[Missions API] Could not fetch user CEFR level, using default A1')
    }

    const cefrLevel = user?.cefr_level || 'A1'

    // Get ALL missions from Supabase (for all levels)
    console.log('[Missions API] Fetching all missions from Supabase for user:', userId, 'CEFR:', cefrLevel)
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('*')
      .limit(100)
    
    if (missionsError) {
      console.error('[Missions API] Supabase error:', missionsError.message)
      return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 })
    }
    
    console.log('[Missions API] Loaded', missions?.length || 0, 'total missions from Supabase')
    const response = NextResponse.json({ 
      missions: missions || [], 
      cefr_level: cefrLevel
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (e) {
    console.error('[Missions API] Error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
