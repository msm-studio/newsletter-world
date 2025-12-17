require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLevels() {
  const { data, error } = await supabase
    .from('levels')
    .select('id, name, theme, order_index, unlocked_by_default')
    .order('order_index');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Levels in database:');
  console.log(JSON.stringify(data, null, 2));
}

checkLevels();
