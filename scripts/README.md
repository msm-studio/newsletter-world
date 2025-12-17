# Database Management Scripts

This directory contains utility scripts for managing the Turt World database.

## Prerequisites

All scripts require `.env.local` to be configured with:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Available Scripts

### check-levels.js
View all levels in the database with their order, theme, and unlock status.

```bash
node scripts/check-levels.js
```

### check-arctic.js
Debug script to view details of the Arctic Adventure level (or any specific level by theme).

```bash
node scripts/check-arctic.js
```

### update-coins.js
Update coin counts for all levels based on a formula (currently: level × 10 + 20).

```bash
node scripts/update-coins.js
```

**Note**: This script adds coins to levels that don't have enough. Review the target coin count formula before running.

## Creating New Levels

To add a new level, use the Supabase SQL Editor or create a new script following this pattern:

```javascript
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Your database operations here
```

## Security Note

These scripts use the anon key which has limited permissions. For admin operations like creating tables or altering schemas, use the Supabase SQL Editor or psql with service role credentials.
