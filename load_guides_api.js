#!/usr/bin/env node

// Simple script to load guides via API endpoint
const baseUrl = process.argv[2] || "http://localhost:3000";
const seedKey = process.argv[3] || "dev-seed-key";

async function loadGuides() {
  console.log(`📚 Loading guides via API from ${baseUrl}...`);

  try {
    const response = await fetch(`${baseUrl}/api/seed/load-guides`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-seed-key": seedKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`❌ Error (${response.status}):`, error);
      process.exit(1);
    }

    const result = await response.json();
    console.log(`✅ Success:`, result.message);
    console.log(`   Loaded: ${result.loaded} guides`);
    if (result.errors > 0) {
      console.log(`   Errors: ${result.errors}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(`❌ Failed to connect to API:`, err.message);
    console.log("\nMake sure the server is running at", baseUrl);
    console.log("Usage: node load_guides_api.js [baseUrl] [seedKey]");
    console.log("Example: node load_guides_api.js http://localhost:3000 my-seed-key");
    process.exit(1);
  }
}

loadGuides();
