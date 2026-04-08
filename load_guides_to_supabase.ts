import { createClient } from "@supabase/supabase-js";
import guides from "./frontend/seed_guides.json";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function loadGuides() {
  console.log(`📚 Loading ${guides.length} guides to Supabase...`);

  for (const guide of guides) {
    try {
      // Update or insert guide
      const { data, error } = await supabase
        .from("guides")
        .upsert(
          {
            id: guide.id,
            title: guide.title,
            description: guide.description,
            cover_emoji: guide.cover_emoji,
            cefr_level: guide.cefr_level,
            concept_tags: guide.concept_tags,
            estimated_minutes: guide.estimated_minutes,
            content: guide.content, // JSON object
            mission_connection: guide.mission_connection,
            story_connection: guide.story_connection,
            scene_concepts: guide.scene_concepts,
            is_published: guide.is_published,
            created_at: guide.created_at,
          },
          { onConflict: "id" }
        );

      if (error) {
        console.error(`❌ Error loading guide ${guide.id}:`, error);
      } else {
        console.log(`✅ Guide "${guide.title}" loaded successfully`);
      }
    } catch (err) {
      console.error(`❌ Error processing guide ${guide.id}:`, err);
    }
  }

  console.log("✨ Done!");
}

loadGuides();
