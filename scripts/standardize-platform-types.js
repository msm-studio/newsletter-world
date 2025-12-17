require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function standardizePlatforms() {
  // Sandy Scramble - make all platforms "sand"
  const { data: sandy, error: sandyFetchError } = await supabase
    .from('levels')
    .select('layout')
    .eq('theme', 'Desert')
    .single();

  if (sandyFetchError) {
    console.error('Error fetching Sandy Scramble:', sandyFetchError);
    process.exit(1);
  }

  const sandyUpdated = {
    ...sandy.layout,
    platforms: sandy.layout.platforms.map(p => ({ ...p, type: 'sand' }))
  };

  console.log('Sandy Scramble: Changed all platforms to "sand"');

  await supabase
    .from('levels')
    .update({ layout: sandyUpdated })
    .eq('theme', 'Desert');

  // Seaside Sprint - make all platforms "wood"
  const { data: seaside, error: seasideFetchError } = await supabase
    .from('levels')
    .select('layout')
    .eq('theme', 'Seaside')
    .single();

  if (seasideFetchError) {
    console.error('Error fetching Seaside Sprint:', seasideFetchError);
    process.exit(1);
  }

  const seasideUpdated = {
    ...seaside.layout,
    platforms: seaside.layout.platforms.map(p => ({ ...p, type: 'wood' }))
  };

  console.log('Seaside Sprint: Changed all platforms to "wood"');

  await supabase
    .from('levels')
    .update({ layout: seasideUpdated })
    .eq('theme', 'Seaside');

  console.log('\n✅ Platform types standardized!');
}

standardizePlatforms();
