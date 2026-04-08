const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function loadMissions() {
  try {
    const dbPath = path.join(__dirname, 'data', 'db.json')
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
    const missions = db.missions || []

    console.log(`[Missions Load] Found ${missions.length} missions in db.json`)

    if (missions.length === 0) {
      console.log('No missions to load')
      return
    }

    // Check if missions table exists and has data
    const { data: existing } = await supabase
      .from('missions')
      .select('id')
      .limit(1)

    if (existing && existing.length > 0) {
      console.log('Missions already exist in Supabase, skipping...')
      return
    }

    console.log('Inserting missions to Supabase...')
    
    const { data, error } = await supabase
      .from('missions')
      .insert(missions, { returning: 'minimal' })

    if (error) {
      console.error('Error inserting missions:', error.message)
      process.exit(1)
    }

    console.log(`✅ Successfully loaded ${missions.length} missions to Supabase`)
  } catch (e) {
    console.error('Error:', e)
    process.exit(1)
  }
}

loadMissions()
