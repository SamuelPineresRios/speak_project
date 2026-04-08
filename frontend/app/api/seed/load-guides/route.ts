import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import guides from "@/seed_guides.json";

// This is an internal API endpoint for loading seed data
// Should be called with proper authorization

export async function POST(req: NextRequest) {
  try {
    // Basic security check - only allow from localhost or with special header
    const authHeader = req.headers.get("x-seed-key");
    if (authHeader !== process.env.SEED_API_KEY && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log(`📚 Loading ${guides.length} guides to Supabase...`);
    let loadedCount = 0;
    let errorCount = 0;

    for (const guide of guides) {
      try {
        const { error } = await supabase
          .from("guides")
          .upsert({
            id: guide.id,
            title: guide.title,
            description: guide.description,
            cover_emoji: guide.cover_emoji,
            cefr_level: guide.cefr_level,
            concept_tags: guide.concept_tags,
            estimated_minutes: guide.estimated_minutes,
            content: guide.content,
            mission_connection: guide.mission_connection,
            story_connection: guide.story_connection,
            scene_concepts: guide.scene_concepts,
            is_published: guide.is_published,
            created_at: guide.created_at,
          });

        if (error) {
          console.error(`❌ Error loading guide ${guide.id}:`, error);
          errorCount++;
        } else {
          console.log(`✅ Guide "${guide.title}" loaded`);
          loadedCount++;
        }
      } catch (err) {
        console.error(`❌ Error processing guide ${guide.id}:`, err);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Loaded ${loadedCount} guides, ${errorCount} errors`,
      loaded: loadedCount,
      errors: errorCount,
    });
  } catch (error) {
    console.error("[SEED_LOAD_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to load guides", details: String(error) },
      { status: 500 }
    );
  }
}
