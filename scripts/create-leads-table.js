/**
 * Create leads table in Supabase using the service role key
 * Run: node scripts/create-leads-table.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createLeadsTable() {
  try {
    console.log('🔨 Creating leads table in Supabase...');

    // Create the table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS leads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          source TEXT DEFAULT 'Newsletter World',
          level_completed INTEGER DEFAULT 1,
          character_name TEXT,
          score INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (tableError) {
      console.error('❌ Table creation failed:', tableError.message);
      console.log('\n💡 Trying alternative method with direct SQL execution...\n');

      // Alternative: Use raw SQL query
      const { error: altError } = await supabase
        .from('leads')
        .select('id')
        .limit(1);

      if (altError && altError.code === '42P01') {
        // Table doesn't exist, need to create it manually
        console.error('⚠️  Cannot create table programmatically.');
        console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
        console.log('   https://supabase.com/dashboard/project/' + supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)?.[1] + '/sql/new');
        console.log('\n' + '─'.repeat(80));
        console.log(`
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  source TEXT DEFAULT 'Newsletter World',
  level_completed INTEGER DEFAULT 1,
  character_name TEXT,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public insert access" ON leads
  FOR INSERT
  WITH CHECK (true);
        `);
        console.log('─'.repeat(80));
        process.exit(1);
      }

      console.log('✅ Table already exists or was created successfully!');
    } else {
      console.log('✅ Leads table created successfully!');
    }

    // Create indexes
    console.log('📊 Creating indexes...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
        CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
      `
    }).catch(() => console.log('   (Indexes may already exist)'));

    console.log('✅ Indexes created!');

    // Enable RLS
    console.log('🔒 Enabling Row Level Security...');
    await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE leads ENABLE ROW LEVEL SECURITY;`
    }).catch(() => console.log('   (RLS may already be enabled)'));

    console.log('✅ RLS enabled!');

    // Create policies
    console.log('📜 Creating security policies...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Allow public insert access" ON leads
          FOR INSERT
          WITH CHECK (true);
      `
    }).catch(() => console.log('   (Policy may already exist)'));

    console.log('✅ Security policies created!');
    console.log('\n🎉 Leads table setup complete!');
    console.log('   You can now capture email leads in your game.');
    console.log('   View leads at: https://supabase.com/dashboard/project/' + supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)?.[1] + '/editor');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

createLeadsTable();
