import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readDB, filterBy } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || 'test-student-001'
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('[Missions API] No Supabase credentials, falling back to local DB')
      // Fallback to local DB if Supabase not configured
      const db = readDB()
      const user = db.users.find(u => u.id === userId)
      const cefrLevel = user?.cefr_level || 'A1'
      
      // Add status to each mission based on narrative_states
      const missionsWithStatus = (db.missions || []).map((mission: any) => {
        const narrativeState = db.narrative_states.find(
          n => n.student_id === userId && n.mission_id === mission.id
        )
        return {
          ...mission,
          status: narrativeState?.state === 'completed' ? 'completed' : 
                  narrativeState?.state === 'paused' ? 'paused' : 
                  narrativeState ? 'in_progress' : 'not_started'
        }
      })
      
      return NextResponse.json({ 
        missions: missionsWithStatus, 
        cefr_level: cefrLevel
      })
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
    
    // Now merge with local narrative_states to add status
    const db = readDB()
    const missionsWithStatus = (missions || []).map((mission: any) => {
      const narrativeState = db.narrative_states.find(
        n => n.student_id === userId && n.mission_id === mission.id
      )
      return {
        ...mission,
        status: narrativeState?.state === 'completed' ? 'completed' : 
                narrativeState?.state === 'paused' ? 'paused' : 
                narrativeState ? 'in_progress' : 'not_started'
      }
    })
    
    const response = NextResponse.json({ 
      missions: missionsWithStatus, 
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
