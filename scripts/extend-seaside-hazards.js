require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function extendSeasideHazards() {
  const { data: level, error: fetchError } = await supabase
    .from('levels')
    .select('layout')
    .eq('theme', 'Seaside')
    .single();

  if (fetchError) {
    console.error('Error fetching Seaside level:', fetchError);
    process.exit(1);
  }

  console.log('Current hazards:', level.layout.hazards.length);
  console.log('Last hazard at x:', level.layout.hazards[level.layout.hazards.length - 1].x);

  // Add more crabs to extend to the end of the level (around x=5200)
  const newHazards = [];
  for (let x = 4950; x <= 5200; x += 450) {
    newHazards.push({
      x: x,
      y: 570,
      width: 40,
      height: 30,
      type: 'crab'
    });
  }

  const updatedLayout = {
    ...level.layout,
    hazards: [...level.layout.hazards, ...newHazards]
  };

  console.log('New hazards:', updatedLayout.hazards.length);
  console.log('Last hazard at x:', updatedLayout.hazards[updatedLayout.hazards.length - 1].x);

  const { error: updateError } = await supabase
    .from('levels')
    .update({ layout: updatedLayout })
    .eq('theme', 'Seaside');

  if (updateError) {
    console.error('Error updating Seaside level:', updateError);
    process.exit(1);
  }

  console.log('\n✅ Seaside hazards extended!');
}

extendSeasideHazards();
