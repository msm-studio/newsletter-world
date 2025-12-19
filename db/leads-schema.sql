-- Email Leads Capture Table
-- Run this in your Supabase SQL editor to add lead tracking

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

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow public insert access (for lead capture)
CREATE POLICY IF NOT EXISTS "Allow public insert access" ON leads
  FOR INSERT
  WITH CHECK (true);

-- Optional: Allow public read access (if you want to show lead count, etc.)
-- CREATE POLICY IF NOT EXISTS "Allow public read access" ON leads
--   FOR SELECT
--   USING (true);
