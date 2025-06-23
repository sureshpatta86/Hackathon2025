#!/bin/bash
# Azure startup script to ensure database directory is writable

echo "🚀 Starting HealthComm Azure deployment..."

# Ensure data directory exists and is writable
mkdir -p /home/site/wwwroot/data
chmod 755 /home/site/wwwroot/data

# Check if database exists, if not create it
if [ ! -f "/home/site/wwwroot/data/dev.db" ]; then
    echo "📊 Creating SQLite database..."
    touch /home/site/wwwroot/data/dev.db
    chmod 644 /home/site/wwwroot/data/dev.db
    
    # Set DATABASE_URL for this session
    export DATABASE_URL="file:./data/dev.db"
    
    # Run database setup
    cd /home/site/wwwroot
    npx prisma db push
    
    # Create admin user if it doesn't exist
    npx tsx scripts/create-admin.ts || echo "Admin user creation failed or already exists"
else
    echo "✅ Database already exists"
fi

# Start the Next.js application
echo "🎯 Starting Next.js application..."
npm start
