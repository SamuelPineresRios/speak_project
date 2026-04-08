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
    
    // Get missions from Supabase
    console.log('[Missions API] Fetching missions from Supabase for user:', userId)
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('*')
      .limit(20)
    
    if (missionsError) {
      console.error('[Missions API] Supabase error:', missionsError.message)
      return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 })
    }
    
    console.log('[Missions API] Loaded', missions?.length || 0, 'missions from Supabase')
    return NextResponse.json({ 
      missions: missions || [], 
      cefr_level: 'B1'  // Default CEFR level for testing
    })
  } catch (e) {
    console.error('[Missions API] Error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
