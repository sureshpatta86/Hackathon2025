# Azure Database for PostgreSQL Migration Guide

This guide will help you migrate from SQLite to Azure Database for PostgreSQL.

## Prerequisites

1. **Azure Account**: Ensure you have an active Azure subscription
2. **Azure CLI**: Install and configure Azure CLI
3. **Node.js**: Version 20.x or higher
4. **PostgreSQL Client**: For database management (optional)

## Step 1: Create Azure Database for PostgreSQL

### Using Azure Portal:
1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" → "Databases" → "Azure Database for PostgreSQL"
3. Choose "Flexible server" (recommended)
4. Configure the following:
   - **Server name**: Your unique server name (e.g., `healthcomm-db-server`)
   - **Admin username**: `healthcomm_admin`
   - **Password**: Create a strong password
   - **Region**: Choose your preferred region
   - **PostgreSQL version**: 15 or later
   - **Compute + storage**: Choose based on your needs (Start with B1ms for development)

### Using Azure CLI:
```bash
# Create resource group
az group create --name healthcomm-rg --location centralindia

# Create PostgreSQL server
az postgres flexible-server create \
  --resource-group healthcomm-rg \
  --name healthcomm-db-server \
  --location centralindia \
  --admin-user healthcomm_admin \
  --admin-password YourStrongPassword123! \
  --version 15 \
  --sku-name Standard_B1ms \
  --storage-size 32

# Create database
az postgres flexible-server db create \
  --resource-group healthcomm-rg \
  --server-name healthcomm-db-server \
  --database-name healthcomm_db
```

## Step 2: Configure Firewall Rules

### Allow Azure services:
```bash
az postgres flexible-server firewall-rule create \
  --resource-group healthcomm-rg \
  --name healthcomm-db-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### Allow your local IP (for development):
```bash
# Get your public IP
curl ifconfig.me

# Add firewall rule for your IP
az postgres flexible-server firewall-rule create \
  --resource-group healthcomm-rg \
  --name healthcomm-db-server \
  --rule-name AllowMyIP \
  --start-ip-address YOUR_PUBLIC_IP \
  --end-ip-address YOUR_PUBLIC_IP
```

## Step 3: Get Connection String

```bash
az postgres flexible-server show-connection-string \
  --server-name healthcomm-db-server \
  --admin-user healthcomm_admin \
  --admin-password YourStrongPassword123! \
  --database-name healthcomm_db
```

## Step 4: Update Environment Variables

Create a `.env.local` file in your project root:

```env
DATABASE_URL="postgresql://healthcomm_admin:YourStrongPassword123!@healthcomm-db-server.postgres.database.azure.com:5432/healthcomm_db?sslmode=require"
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000
MESSAGING_MODE=demo
```

## Step 5: Run Migration

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma db push

# Seed the database (optional)
npm run db:seed
```

## Step 6: Verify Connection

```bash
# Test the database connection
npx prisma studio
```

## Security Best Practices

1. **Use SSL**: Always use `sslmode=require` in your connection string
2. **Strong Passwords**: Use complex passwords for database users
3. **Firewall Rules**: Only allow necessary IP addresses
4. **Environment Variables**: Never commit sensitive data to version control
5. **Azure Key Vault**: Consider using Azure Key Vault for secrets management

## Monitoring and Maintenance

1. **Enable monitoring** in Azure Portal
2. **Set up alerts** for performance metrics
3. **Schedule backups** (automatic with Azure Database for PostgreSQL)
4. **Monitor costs** using Azure Cost Management

## Troubleshooting

### Connection Issues:
- Verify firewall rules
- Check SSL requirements
- Validate connection string format

### Performance Issues:
- Monitor CPU and memory usage
- Check query performance
- Consider scaling up the server

### Common Errors:
- `connection refused`: Check firewall settings
- `SSL required`: Ensure `sslmode=require` in connection string
- `authentication failed`: Verify username and password
