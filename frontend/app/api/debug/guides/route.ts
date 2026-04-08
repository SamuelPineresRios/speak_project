import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { data: guides, error } = await supabase
      .from("guides")
      .select("*")
      .limit(1);

    if (error) {
      return NextResponse.json({
        error: error.message,
        details: error,
      });
    }

    if (!guides || guides.length === 0) {
      return NextResponse.json({
        message: "No guides found in database",
        guides: [],
      });
    }

    const guide = guides[0];
    return NextResponse.json({
      message: "Sample guide from database",
      guide: {
        id: guide.id,
        title: guide.title,
        description: guide.description,
        cover_emoji: guide.cover_emoji,
        cefr_level: guide.cefr_level,
        content: guide.content,
        content_type: typeof guide.content,
        content_keys: guide.content ? Object.keys(guide.content) : null,
        has_exercises: guide.content?.exercises ? true : false,
        exercises_count: guide.content?.exercises?.length || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
