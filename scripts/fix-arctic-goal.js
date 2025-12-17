require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixArcticGoal() {
  // Get current Arctic level
  const { data: level, error: fetchError } = await supabase
    .from('levels')
    .select('layout')
    .eq('theme', 'arctic')
    .single();

  if (fetchError) {
    console.error('Error fetching Arctic level:', fetchError);
    process.exit(1);
  }

  console.log('Current Arctic goal:', level.layout.goal);

  // Platform is at y=450, so goal bottom should be at y=430 (450 - 20)
  // Goal has height=50, so new y should be 430 - 50 = 380
  const updatedLayout = {
    ...level.layout,
    goal: {
      ...level.layout.goal,
      y: 380  // Changed from 420 to 380
    }
  };

  console.log('Updated Arctic goal:', updatedLayout.goal);
  console.log('Goal bottom will be at:', updatedLayout.goal.y + updatedLayout.goal.height);
  console.log('Platform top is at: 450');
  console.log('Gap (should be -20):', (updatedLayout.goal.y + updatedLayout.goal.height) - 450);

  // Update the database
  const { error: updateError } = await supabase
    .from('levels')
    .update({ layout: updatedLayout })
    .eq('theme', 'arctic');

  if (updateError) {
    console.error('Error updating Arctic level:', updateError);
    process.exit(1);
  }

  console.log('\n✅ Arctic goal position fixed!');
}

fixArcticGoal();
