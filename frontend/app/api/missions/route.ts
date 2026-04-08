import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('cefr_level')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all missions
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('*')

    if (missionsError) {
      console.error('Error fetching missions:', missionsError)
      return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 })
    }

    // Get narrative states for this user
    const { data: narrativeStates, error: statesError } = await supabase
      .from('narrative_states')
      .select('*')
      .eq('student_id', userId)
      .is('group_id', null) // Only global narrative states

    if (statesError && statesError.code !== 'PGRST116') {
      console.error('Error fetching narrative states:', statesError)
      return NextResponse.json({ error: 'Failed to fetch narrative states' }, { status: 500 })
    }

    // Map mission states
    const stateMap = Object.fromEntries(
      (narrativeStates || []).map(n => [n.mission_id, n.state])
    )

    const missionsWithStatus = (missions || []).map(m => ({
      ...m,
      status: stateMap[m.id] ?? 'not_started'
    }))

    return NextResponse.json({
      missions: missionsWithStatus,
      cefr_level: user?.cefr_level ?? null
    })
  } catch (err) {
    console.error('Missions API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
