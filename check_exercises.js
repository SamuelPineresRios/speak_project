const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cwgikclmvdxfrfrdtqxo.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3Z2lrY2xtdmR4ZnJmcmR0cXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI3NjAwMDAsImV4cCI6MTkxMjc2MDAwMH0.wQfDCR-FjvAW8lv4J0Q5KlYgZr1bqPQ5z2P9vU3X-_Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExercises() {
  try {
    const { data: guides, error } = await supabase
      .from('guides')
      .select('id, title, exercises')
      .limit(3);

    if (error) {
      console.error('Error fetching guides:', error);
      return;
    }

    console.log('Found guides:');
    guides.forEach(guide => {
      console.log(`\nGuide: ${guide.title} (${guide.id})`);
      console.log(`Exercises type: ${typeof guide.exercises}`);
      console.log(`Exercises value:`, guide.exercises);
      if (Array.isArray(guide.exercises)) {
        console.log(`Exercises count: ${guide.exercises.length}`);
        console.log('First exercise:', guide.exercises[0]);
      }
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

checkExercises();
