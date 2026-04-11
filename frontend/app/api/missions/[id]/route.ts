import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const missionId = params.id
    console.log('[Mission GET] Fetching mission:', missionId)
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Mission GET] Missing Supabase credentials')
      return NextResponse.json(
        { error: 'Server misconfigured: missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch mission from Supabase - use wildcard to get all available columns
    const { data: mission, error } = await supabase
      .from('missions')
      .select('*')
      .eq('id', missionId)
      .single()

    if (error) {
      console.error('[Mission GET] Supabase error:', error.message)
      console.error('[Mission GET] Error details:', error)
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      )
    }

    // Log available columns for debugging
    if (mission) {
      console.log('[Mission GET] Mission columns:', Object.keys(mission))
    }

    if (!mission) {
      console.log('[Mission GET] Mission not found:', missionId)
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      )
    }

    console.log('[Mission GET] Successfully fetched mission:', missionId)
    
    // Return response with no-cache headers to prevent stale data
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
