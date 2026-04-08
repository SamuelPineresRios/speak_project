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

const supabaseUrl = envData.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envData.NEXT_PUBLIC_SUPABASE_ANON_KEY || envData.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function loadContentColumns() {
  try {
    const dbPath = path.join(__dirname, "frontend/data/db.json");
    const dbContent = fs.readFileSync(dbPath, "utf-8");
    const db = JSON.parse(dbContent);

    console.log(`\n📝 Loading additional content columns for ${db.guides.length} guides...\n`);

    let updated = 0;
    let failed = 0;

    for (const guide of db.guides) {
      try {
        const content = guide.content || {};
        
        console.log(`Updating ${guide.id}:`);

        const updateData = {
          key_structures: JSON.stringify(content.key_structures || []),
          common_expressions: JSON.stringify(content.common_expressions || []),
          real_life_examples: JSON.stringify(content.real_life_examples || []),
        };

        const { error } = await supabase
          .from("guides")
          .update(updateData)
          .eq("id", guide.id);

        if (error) {
          console.error(`  ❌ ERROR: ${error.message}`);
          failed++;
        } else {
          console.log(`  ✓ key_structures, common_expressions, real_life_examples updated`);
          updated++;
        }
      } catch (err) {
        console.error(`  ❌ ERROR: ${err.message}`);
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

loadContentColumns();
