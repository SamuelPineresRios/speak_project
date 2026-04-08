import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const studentId = request.headers.get("x-user-id") || "test-student-001"

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get filter parameters
    const { searchParams } = new URL(request.url)
    const cefrLevel = searchParams.get("cefr_level")
    const conceptTag = searchParams.get("concept_tag")

    // Fetch guides from Supabase
    let query = supabase.from("guides").select("*")

    if (cefrLevel) {
      query = query.eq("cefr_level", cefrLevel)
    }

    if (conceptTag) {
      query = query.contains("concept_tags", [conceptTag])
    }

    const { data: guides, error } = await query

    if (error) {
      console.error("[Guides API] Supabase error:", error.message)
      return NextResponse.json(
        { error: "Failed to fetch guides" },
        { status: 500 }
      )
    }

    console.log("[Guides API] Loaded", guides?.length || 0, "guides from Supabase")
    return NextResponse.json({ guides: guides || [] })
  } catch (e) {
    console.error("[Guides API] Error:", e)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
