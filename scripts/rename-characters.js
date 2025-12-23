require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const characterRenames = [
  { oldName: 'Turtle', newName: 'Transactional Turtle' },
  { oldName: 'Pig', newName: 'Postmaster Pig' },
  { oldName: 'Lemur', newName: 'Letter Lemur' },
  { oldName: 'Pomeranian', newName: 'Deliverability Dog' },
];

async function renameCharacters() {
  console.log('Renaming characters to newsletter theme...\n');

  for (const { oldName, newName } of characterRenames) {
    const { data, error } = await supabase
      .from('characters')
      .update({ name: newName })
      .eq('name', oldName)
      .select();

    if (error) {
      console.error(`❌ Failed to rename ${oldName}:`, error);
    } else if (data && data.length > 0) {
      console.log(`✅ Renamed: ${oldName} → ${newName}`);
    } else {
      console.log(`⚠️  Character not found: ${oldName}`);
    }
  }

  console.log('\n✨ Character renaming complete!');
}

renameCharacters();
