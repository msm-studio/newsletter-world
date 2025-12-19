/**
 * Setup leads table in Supabase via direct SQL
 * Run: node scripts/setup-leads-table.js
 */

import pkg from 'pg';
const { Client } = pkg;
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
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not parse project reference from Supabase URL');
  process.exit(1);
}

// Construct database connection string
// Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
const connectionString = `postgresql://postgres.${projectRef}:${supabaseServiceKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function setupLeadsTable() {
  const client = new Client({ connectionString });

  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected!');

    console.log('🔨 Creating leads table...');
    await client.query(`
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
    `);
    console.log('✅ Leads table created!');

    console.log('📊 Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
    `);
    console.log('✅ Indexes created!');

    console.log('🔒 Enabling Row Level Security...');
    await client.query(`ALTER TABLE leads ENABLE ROW LEVEL SECURITY;`);
    console.log('✅ RLS enabled!');

    console.log('📜 Creating security policies...');
    await client.query(`
      DROP POLICY IF EXISTS "Allow public insert access" ON leads;
    `);
    await client.query(`
      CREATE POLICY "Allow public insert access" ON leads
        FOR INSERT
        WITH CHECK (true);
    `);
    console.log('✅ Security policies created!');

    // Test query
    console.log('\n🧪 Testing table...');
    const result = await client.query(`SELECT COUNT(*) FROM leads;`);
    console.log(`✅ Table is working! Current lead count: ${result.rows[0].count}`);

    console.log('\n🎉 Setup complete!');
    console.log(`   View leads at: https://supabase.com/dashboard/project/${projectRef}/editor`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('password authentication failed')) {
      console.error('\n💡 The service role key appears to be invalid for direct database access.');
      console.error('   This is normal - Supabase service keys work with the API, not direct Postgres.');
      console.error('\n📋 Please run this SQL manually in Supabase SQL Editor:');
      console.error(`   https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
      console.log('─'.repeat(80));
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
    }
  } finally {
    await client.end();
  }
}

setupLeadsTable();
