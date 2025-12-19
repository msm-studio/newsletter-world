/**
 * Add leads table to Supabase database
 * Run: node scripts/add-leads-table.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addLeadsTable() {
  try {
    console.log('📋 Reading leads schema...');
    const schema = readFileSync(join(__dirname, '..', 'db', 'leads-schema.sql'), 'utf8');

    console.log('🔨 Creating leads table in Supabase...');
    console.log('\n⚠️  NOTE: You need to run this SQL manually in Supabase SQL Editor:');
    console.log('   1. Go to https://supabase.com/dashboard/project/' + supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)?.[1]);
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the following SQL:\n');
    console.log('─'.repeat(80));
    console.log(schema);
    console.log('─'.repeat(80));
    console.log('\n✅ After running the SQL, the leads table will be ready!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addLeadsTable();
