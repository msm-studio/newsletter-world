require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkArctic() {
  const { data, error } = await supabase
    .from('levels')
    .select('name, theme, layout')
    .eq('theme', 'arctic')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Arctic level found:');
  console.log('Name:', data.name);
  console.log('Theme:', data.theme);
  console.log('Has platforms:', data.layout.platforms?.length || 0);
  console.log('Has hazards:', data.layout.hazards?.length || 0);
  console.log('Has collectibles:', data.layout.collectibles?.length || 0);

  if (data.layout.hazards && data.layout.hazards.length > 0) {
    console.log('First hazard type:', data.layout.hazards[0].type);
  }
  if (data.layout.platforms && data.layout.platforms.length > 0) {
    console.log('First platform type:', data.layout.platforms[0].type);
  }
}

checkArctic();
