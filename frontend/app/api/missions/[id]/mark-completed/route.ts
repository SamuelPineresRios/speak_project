import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB, generateId, type NarrativeState } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'

const CEFR_PROGRESSION = ['A1', 'A2', 'B1', 'B2', 'C1']

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { group_id } = await req.json().catch(() => ({}))
    const db = readDB()
    const existingStateIdx = db.narrative_states.findIndex(n => n.student_id === userId && n.mission_id === params.id)
    const state: NarrativeState = {
      id: existingStateIdx >= 0 ? db.narrative_states[existingStateIdx].id : generateId(),
      student_id: userId,
      mission_id: params.id,
      group_id: group_id ?? null,
      state: 'completed',
      character_reaction: 'positive',
      scene_position: 1,
      updated_at: new Date().toISOString(),
    }
    if (existingStateIdx >= 0) db.narrative_states[existingStateIdx] = state
    else db.narrative_states.push(state)

    // Optionally update weekly aggregates minimal entry if needed (skip complex updates here)
    writeDB(db)

    // Check if user should be promoted to next level
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Get user's current CEFR level
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('cefr_level')
          .eq('id', userId)
          .single()

        if (user && user.cefr_level) {
          const currentLevel = user.cefr_level
          const currentLevelIndex = CEFR_PROGRESSION.indexOf(currentLevel)

          // Don't promote if already at C1 (max level)
          if (currentLevelIndex < CEFR_PROGRESSION.length - 1) {
            // Count total missions for current level
            const { data: allMissions, error: missionsError } = await supabase
              .from('missions')
              .select('id')
              .eq('cefr_level', currentLevel)

            // Count completed missions for current level
            const { count: completedCount } = await supabase
              .from('narrative_states')
              .select('*', { count: 'exact', head: true })
              .eq('student_id', userId)
              .eq('state', 'completed')
              .in('mission_id', allMissions?.map(m => m.id) ?? [])

            const totalMissions = allMissions?.length || 0
            const completed = completedCount || 0

            // If all missions of current level are completed, promote to next level
            if (totalMissions > 0 && completed >= totalMissions) {
              const nextLevel = CEFR_PROGRESSION[currentLevelIndex + 1]
              
              const { error: updateError } = await supabase
                .from('users')
                .update({ cefr_level: nextLevel })
                .eq('id', userId)

              if (!updateError) {
                console.log(`[MarkCompleted] User promoted from ${currentLevel} to ${nextLevel}`)
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('[MarkCompleted] Error checking promotions:', e)
      // Don't fail the mission completion if promotion check fails
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[MarkCompleted]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
