#!/bin/bash
# Turt World - Database Initialization Script

echo "🎮 Turt World - Database Setup"
echo "================================"

# Read the SQL schema
SQL_CONTENT=$(cat db/schema.sql)

# Use psql to connect and run the schema
echo "Connecting to Supabase database..."

# Get database password
read -sp "Enter your Supabase database password (Settings > Database > Connection string): " DB_PASSWORD
echo ""

# Run the schema
psql "postgresql://postgres:${DB_PASSWORD}@db.qlwqgggdolrvroiypzdu.supabase.co:5432/postgres" << EOF
$SQL_CONTENT
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database setup complete!"
    echo "All tables created and data inserted."
else
    echo "❌ Database setup failed. Check your password and try again."
fi
