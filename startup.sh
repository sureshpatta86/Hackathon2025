#!/bin/bash
# Azure startup script to ensure database directory is writable

echo "🚀 Starting HealthComm Azure deployment..."

# Ensure data directory exists and is writable
mkdir -p /home/site/wwwroot/data
chmod 755 /home/site/wwwroot/data

# Check if database connection is available
echo "📊 Connecting to Azure PostgreSQL database..."

# DATABASE_URL should be set via Azure App Service configuration
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set!"
    exit 1
fi

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
