import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = request.headers.get("x-user-id")

    if (!studentId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const guideId = params.id

    // Fetch guide from Supabase
    const { data: guide, error: guideError } = await supabase
      .from("guides")
      .select("*")
      .eq("id", guideId)
      .single()

    if (guideError || !guide) {
      return NextResponse.json(
        { error: "Guide not found" },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const parseField = (field: any) => {
      if (typeof field === 'string') {
        try {
          return JSON.parse(field)
        } catch {
          return field
        }
      }
      return field
    }

    // Construct complete guide with parsed content
    const completeGuide = {
      ...guide,
      content: {
        definition: parseField(guide.definition),
        explanation: parseField(guide.explanation),
        formula: parseField(guide.formula),
        exercises: parseField(guide.exercises),
        key_structures: parseField(guide.key_structures),
        common_expressions: parseField(guide.common_expressions),
        real_life_examples: parseField(guide.real_life_examples),
      },
    }

    console.log("[Guides Get] Successfully fetched guide", guideId)
    return NextResponse.json({ guide: completeGuide })
  } catch (e) {
    console.error("[Guides Get] Error:", e)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
