import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { data: guides, error } = await supabase
      .from("guides")
      .select("id, title, cefr_level, content");

    if (error) {
      return NextResponse.json({
        error: error.message,
        statusCode: error.code,
      }, { status: 400 });
    }

    if (!guides) {
      return NextResponse.json({
        count: 0,
        message: "No guides found",
        guides: [],
      });
    }

    return NextResponse.json({
      count: guides.length,
      guides: guides.map(g => ({
        id: g.id,
        title: g.title,
        cefr_level: g.cefr_level,
        hasContent: !!g.content,
        contentType: typeof g.content,
      })),
      sample: guides.length > 0 ? guides[0] : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error), stack: error instanceof Error ? error.stack : null },
      { status: 500 }
    );
  }
}
