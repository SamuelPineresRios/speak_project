const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables
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

async function addExercisesColumn() {
  try {
    console.log("📊 Checking 'guides' table structure...\n");

    // Get table structure
    const { data, error } = await supabase
      .from("guides")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Error checking table:", error);
      return;
    }

    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log("Current columns:", columns);
      
      const hasExercises = columns.includes("exercises");
      console.log(`\nColumn 'exercises' exists: ${hasExercises ? '✅ Yes' : '❌ No'}`);
      
      if (!hasExercises) {
        console.log("\n⚠️  Column 'exercises' does NOT exist in Supabase.");
        console.log("📌 You need to add it in Supabase dashboard:");
        console.log("   1. Go to Supabase dashboard");
        console.log("   2. Select your project");
        console.log("   3. Go to SQL Editor");
        console.log("   4. Run this command:");
        console.log("\n   ALTER TABLE guides ADD COLUMN exercises jsonb DEFAULT '[]'::jsonb;");
        console.log("\n   Then run the load_exercises_to_supabase.js script again.");
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

addExercisesColumn();
