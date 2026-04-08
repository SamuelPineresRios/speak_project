#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Load environment variables from .env.local or .env
const envFiles = [".env.local", ".env", "frontend/.env.local", "frontend/.env"];
let envData = {};

for (const envFile of envFiles) {
  const envPath = path.join(__dirname, envFile);
  if (fs.existsSync(envPath)) {
    console.log(`📄 Found ${envFile}`);
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").trim();
          envData[key.trim()] = value;
        }
      }
    });
  }
}

const supabaseUrl = envData.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envData.SUPABASE_SERVICE_ROLE_KEY || envData.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ Missing Supabase credentials!"
  );
  console.error("Set these environment variables in .env.local:");
  console.error("  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url");
  console.error("  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
  console.error("");
  console.error("Or:");
  console.error("  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key");
  process.exit(1);
}

const guides = require("./frontend/seed_guides.json");

async function loadGuides() {
  console.log(`📚 Loading ${guides.length} guides to Supabase...`);
  console.log(`🔗 URL: ${supabaseUrl}`);

  let loadedCount = 0;
  let errorCount = 0;

  for (const guide of guides) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/guides?id=eq.${guide.id}`, {
        method: "DELETE",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      });

      // Now insert the guide
      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/guides`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
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
        }),
      });

      if (!insertResponse.ok) {
        const error = await insertResponse.text();
        console.error(`❌ Error loading guide ${guide.id}:`, error);
        errorCount++;
      } else {
        console.log(`✅ Guide "${guide.title}" (${guide.id}) loaded`);
        loadedCount++;
      }
    } catch (err) {
      console.error(`❌ Error processing guide ${guide.id}:`, err.message);
      errorCount++;
    }
  }

  console.log("");
  console.log(`✨ Complete! Loaded: ${loadedCount}, Errors: ${errorCount}`);
  process.exit(errorCount > 0 ? 1 : 0);
}

loadGuides();

