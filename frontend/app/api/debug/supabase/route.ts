import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('[Debug Supabase] URL:', supabaseUrl?.substring(0, 30))
    console.log('[Debug Supabase] Has Key:', !!supabaseKey)

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Missing Supabase credentials',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test connection
    const { data: missions, error } = await supabase
      .from('missions')
      .select('*')
      .limit(5)

    console.log('[Debug Supabase] Query result:', { count: missions?.length, error: error?.message })

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        missions: null,
        dbPath: 'missions',
        status: 'error'
      })
    }

    return NextResponse.json({ 
      missions: missions || [],
      count: missions?.length || 0,
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      status: 'success'
    })
  } catch (e) {
    console.error('[Debug Supabase] Exception:', e)
    return NextResponse.json({ 
      error: String(e),
      status: 'exception'
    }, { status: 500 })
  }
}
