import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guideId = params.id;

    console.log("[DEBUG] Fetching guide:", guideId);

    // Direct query from Supabase
    const { data: guide, error } = await supabase
      .from("guides")
      .select("*")
      .eq("id", guideId)
      .single();

    if (error) {
      console.error("[DEBUG_ERROR]", error);
      return NextResponse.json({
        error: error.message,
        code: error.code,
      });
    }

    if (!guide) {
      return NextResponse.json({
        error: "Guide not found",
        guideId,
      });
    }

    console.log("[DEBUG_GUIDE]", {
      id: guide.id,
      title: guide.title,
      content_type: typeof guide.content,
      content_is_null: guide.content === null,
      content_is_undefined: guide.content === undefined,
      content_length: typeof guide.content === 'string' ? guide.content.length : 'N/A',
      content_preview: typeof guide.content === 'string' ? guide.content.substring(0, 100) : JSON.stringify(guide.content).substring(0, 100),
    });

    // Try to parse if it's a string
    let parsedContent = guide.content;
    if (typeof guide.content === 'string') {
      try {
        parsedContent = JSON.parse(guide.content);
        console.log("[DEBUG_PARSED] Content successfully parsed from string");
      } catch (e) {
        console.error("[DEBUG_PARSE_ERROR]", e);
      }
    }

    // Show what we're returning
    const returnData = {
      success: true,
      guide: {
        ...guide,
        content: parsedContent,
      },
      debug: {
        original_content_type: typeof guide.content,
        parsed_content_type: typeof parsedContent,
        content_keys: parsedContent && typeof parsedContent === 'object' ? Object.keys(parsedContent) : null,
      },
    };

    console.log("[DEBUG_RETURN]", {
      has_content: !!parsedContent,
      content_type: typeof parsedContent,
      content_keys: parsedContent && typeof parsedContent === 'object' ? Object.keys(parsedContent) : null,
    });

    return NextResponse.json(returnData);
  } catch (error) {
    console.error("[DEBUG_EXCEPTION]", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
