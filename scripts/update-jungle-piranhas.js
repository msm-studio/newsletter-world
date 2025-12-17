require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateJunglePiranhas() {
  // Get current Jungle level
  const { data: level, error: fetchError } = await supabase
    .from('levels')
    .select('layout')
    .eq('theme', 'Jungle')
    .single();

  if (fetchError) {
    console.error('Error fetching Jungle level:', fetchError);
    process.exit(1);
  }

  console.log('Current hazards:', level.layout.hazards.map(h => h.type).join(', '));

  // Update all hazards to be piranhas
  const updatedLayout = {
    ...level.layout,
    hazards: level.layout.hazards.map(h => ({
      ...h,
      type: 'piranha'
    }))
  };

  console.log('Updated hazards:', updatedLayout.hazards.map(h => h.type).join(', '));

  // Update the database
  const { error: updateError } = await supabase
    .from('levels')
    .update({ layout: updatedLayout })
    .eq('theme', 'Jungle');

  if (updateError) {
    console.error('Error updating Jungle level:', updateError);
    process.exit(1);
  }

  console.log('\n✅ Jungle hazards updated to piranhas!');
}

updateJunglePiranhas();
