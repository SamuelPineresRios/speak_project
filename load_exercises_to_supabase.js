const { createClient } = require("@supabase/supabase-js");
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

// Supabase config - Load from environment variables
const supabaseUrl = envData.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envData.NEXT_PUBLIC_SUPABASE_ANON_KEY || envData.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials!");
  console.error("Set these environment variables in .env.local:");
  console.error("  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url");
  console.error("  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function loadExercisesToSupabase() {
  try {
    // Read db.json
    const dbPath = path.join(__dirname, "frontend/data/db.json");
    const dbContent = fs.readFileSync(dbPath, "utf-8");
    const db = JSON.parse(dbContent);

    console.log(`Found ${db.guides.length} guides`);

    let updated = 0;
    let failed = 0;

    for (const guide of db.guides) {
      try {
        const exercises = guide.content?.exercises || [];
        
        console.log(`\nUpdating guide ${guide.id} - "${guide.title}"`);
        console.log(`  Exercises: ${exercises.length}`);

        const { error } = await supabase
          .from("guides")
          .update({
            exercises: JSON.stringify(exercises),
          })
          .eq("id", guide.id);

        if (error) {
          console.error(`  ERROR: ${error.message}`);
          failed++;
        } else {
          console.log(`  ✓ Updated successfully`);
          updated++;
        }
      } catch (err) {
        console.error(`  ERROR: ${err.message}`);
        failed++;
      }
    }

    console.log(`\n✅ Process completed:`);
    console.log(`   Updated: ${updated}/${db.guides.length}`);
    console.log(`   Failed: ${failed}/${db.guides.length}`);
  } catch (err) {
    console.error("Fatal error:", err);
  }
}

loadExercisesToSupabase();
