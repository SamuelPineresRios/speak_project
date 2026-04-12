import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readDB, findById } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const missionId = params.id
    console.log('[Mission GET] Fetching mission:', missionId)
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.log('[Mission GET] No Supabase credentials, falling back to local DB')
      // Fallback to local DB
      const db = readDB()
      const mission = findById(db.missions, missionId)
      if (!mission) {
        return NextResponse.json(
          { error: 'Mission not found' },
          { status: 404 }
        )
      }
      const response = NextResponse.json({ mission, narrative_state: null })
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      return response
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: mission, error } = await supabase
      .from('missions')
      .select('*')
      .eq('id', missionId)
      .single()

    if (error || !mission) {
      console.error('[Mission GET] Mission not found:', missionId, error?.message)
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      )
    }

    console.log('[Mission GET] Found mission:', mission.title)
    const response = NextResponse.json({ mission, narrative_state: null })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (e) {
    console.error('[Mission GET] Exception:', e)
    return NextResponse.json(
      { error: 'Internal server error: ' + String(e) },
      { status: 500 }
    )
  }
}
