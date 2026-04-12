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
          let value = valueParts.join("=").trim();
          // Remove surrounding quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          envData[key.trim()] = value;
        }
      }
    });
  }
}

const OPENROUTER_API_KEY = envData.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

console.log("\n🔍 Environment Check:");
console.log("=====================");
console.log("✅ OPENROUTER_API_KEY configured:", !!OPENROUTER_API_KEY);
if (OPENROUTER_API_KEY) {
  console.log("   Key length:", OPENROUTER_API_KEY.length);
  console.log("   First 10 chars: " + OPENROUTER_API_KEY.substring(0, 10) + "...");
}

if (!OPENROUTER_API_KEY) {
  console.error("\n❌ ERROR: OPENROUTER_API_KEY not found in environment!");
  console.error("   Add OPENROUTER_API_KEY=sk-or-xxxx to your .env.local file");
  process.exit(1);
}

console.log("\n🚀 Testing OpenRouter Connection...");
console.log("====================================\n");

async function testOpenRouterConnection() {
  try {
    console.log("📡 Sending test request to OpenRouter...");
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vox.app",
        "X-Title": "VOX - Test",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "user",
            content: "Say 'Connection successful' in exactly 3 words."
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    console.log("📬 Response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("\n❌ OpenRouter Error:");
      console.error("Status:", response.status);
      console.error("Response:", errorText.substring(0, 500));
      
      try {
        const errorData = JSON.parse(errorText);
        console.error("\nParsed error:", JSON.stringify(errorData, null, 2));
      } catch {}
      
      return false;
    }

    const result = await response.json();
    console.log("\n✅ SUCCESS! OpenRouter is working.");
    console.log("Response:", result.choices[0].message.content);
    return true;

  } catch (error) {
    console.error("\n❌ Connection failed:");
    console.error("Error:", error.message);
    return false;
  }
}

testOpenRouterConnection().then(success => {
  if (success) {
    console.log("\n✨ Everything is properly connected!");
    process.exit(0);
  } else {
    console.log("\n⚠️  OpenRouter connection failed. Check your API key.");
    process.exit(1);
  }
});
