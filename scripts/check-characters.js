require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCharacters() {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Current characters in database:\n');
  data.forEach(char => {
    console.log(`- ${char.name}`);
  });
}

checkCharacters();
