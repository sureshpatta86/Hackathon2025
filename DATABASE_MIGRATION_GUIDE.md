# 🔄 Database Migration: SQLite to Azure PostgreSQL

This document provides a comprehensive guide for migrating your HealthComm application from SQLite to Azure Database for PostgreSQL.

## 🎯 Migration Overview

The migration includes:
- ✅ Updated Prisma schema for PostgreSQL
- ✅ New PostgreSQL dependencies
- ✅ Azure deployment scripts
- ✅ Automated setup tools
- ✅ Production-ready configuration

## 🚀 Quick Start Migration

### Option 1: Automated Setup (Recommended)

#### For macOS/Linux:
```bash
npm run azure:setup
```

#### For Windows:
```bash
npm run azure:setup-windows
```

### Option 2: Manual Setup

#### Prerequisites:
1. Azure CLI installed and configured
2. Active Azure subscription
3. Node.js 20.x or higher
     --resource-group healthcomm-rg \
     --name healthcomm-db-server \
     --location eastus \
     --admin-user healthcomm_admin \
     --admin-password "$AZURE_POSTGRES_ADMIN_PASSWORD" \
     --version 15 \
     --sku-name Standard_B1ms \
     --storage-size 32 \
   # Create resource group
   az group create --name healthcomm-rg --location eastus
   
   # Create PostgreSQL server
   az postgres flexible-server create \
     --resource-group healthcomm-rg \
     --name healthcomm-db-server \
     --location eastus \
     --admin-user healthcomm_admin \
     --admin-password YourStrongPassword123! \
     --version 15 \
     --sku-name Standard_B1ms \
     --storage-size 32 \
     --public-access 0.0.0.0
   
   # Create database
   az postgres flexible-server db create \
     --resource-group healthcomm-rg \
     --server-name healthcomm-db-server \
     --database-name healthcomm_db
   ```

2. **Configure Firewall:**
3. **Update Environment Variables:**
   Create `.env.local` file:
   ```env
   DATABASE_URL="postgresql://healthcomm_admin:${AZURE_POSTGRES_ADMIN_PASSWORD}@healthcomm-db-server.postgres.database.azure.com:5432/healthcomm_db?sslmode=require"
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
     --end-ip-address 0.0.0.0
   
   # Allow your IP
   az postgres flexible-server firewall-rule create \
     --resource-group healthcomm-rg \
     --name healthcomm-db-server \
     --rule-name AllowMyIP \
     --start-ip-address YOUR_PUBLIC_IP \
     --end-ip-address YOUR_PUBLIC_IP
   ```

3. **Update Environment Variables:**
   Create `.env.local` file:
   ```env
   DATABASE_URL="postgresql://healthcomm_admin:YourStrongPassword123!@healthcomm-db-server.postgres.database.azure.com:5432/healthcomm_db?sslmode=require"
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   NEXTAUTH_SECRET=your_nextauth_secret_key_here
   NEXTAUTH_URL=http://localhost:3000
   MESSAGING_MODE=demo
   ```

4. **Run Migration:**
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

## 📊 Database Schema Changes

The PostgreSQL schema includes several improvements:

### Key Changes:
- **Provider**: Changed from `sqlite` to `postgresql`
- **Connection**: Uses connection string with SSL requirement
- **Data Types**: Optimized for PostgreSQL
- **Indexes**: Enhanced for better performance

### Schema Features:
- ✅ Patient management with communication preferences
- ✅ Appointment scheduling and reminders
- ✅ Template-based messaging system
- ✅ Communication history and analytics
- ✅ Patient groups for bulk messaging
- ✅ Scheduled communications with recurrence
- ✅ User authentication and authorization

## 🔧 Available Commands

### Database Management:
```bash
npm run db:setup          # Generate client and push schema
npm run db:migrate         # Create and run migrations
npm run db:deploy          # Deploy migrations (production)
npm run db:studio          # Open Prisma Studio
npm run db:seed            # Seed database with sample data
npm run db:reset           # Reset database (development only)
```

### Azure Management:
```bash
npm run azure:setup        # Setup Azure PostgreSQL (Unix)
npm run azure:setup-windows # Setup Azure PostgreSQL (Windows)
```

### Development:
```bash
npm run dev                # Start development server
npm run start:demo         # Start in demo mode
npm run start:live         # Start in live messaging mode
npm run build              # Build for production
npm run start              # Start production server
```

## 🔒 Security Considerations

### SSL/TLS:
- ✅ SSL required for all connections
- ✅ Azure managed certificates
- ✅ Encrypted data in transit

### Access Control:
- ✅ Firewall rules configured
- ✅ Admin user with strong password
- ✅ Network isolation options

### Environment Variables:
- ✅ Secure secret management
- ✅ Production vs development configs
- ✅ Azure Key Vault integration ready

## 📈 Performance Optimizations

### Database:
- Indexed primary keys and foreign keys
- Optimized query patterns
- Connection pooling ready

### Azure PostgreSQL Features:
- Automatic backups
- Point-in-time recovery
- High availability options
- Performance monitoring

## 🚀 Deployment to Azure App Service

### Automated Deployment:
1. **Create App Service:**
   ```bash
   az webapp create \
     --resource-group healthcomm-rg \
     --plan healthcomm-plan \
     --name healthcomm-app \
     --runtime "NODE|20-lts"
   ```

2. **Configure App Settings:**
   ```bash
   az webapp config appsettings set \
     --resource-group healthcomm-rg \
     --name healthcomm-app \
     --settings DATABASE_URL="your_connection_string"
   ```

3. **Deploy Code:**
   ```bash
   az webapp deployment source config \
     --resource-group healthcomm-rg \
     --name healthcomm-app \
     --repo-url https://github.com/your-repo \
     --branch main
   ```

## 🔍 Troubleshooting

### Common Issues:

#### Connection Refused:
- Check firewall rules
- Verify server status
- Confirm SSL settings

#### Authentication Failed:
- Verify username/password
- Check connection string format
- Ensure database exists

#### Migration Errors:
- Check Prisma schema syntax
- Verify database permissions
- Review connection string

### Debugging Commands:
```bash
# Test connection
npx prisma studio

# Check schema
npx prisma validate

# View generated client
npx prisma generate --help

# Database introspection
npx prisma db pull
```

## 📚 Additional Resources

- [Azure Database for PostgreSQL Documentation](https://docs.microsoft.com/en-us/azure/postgresql/)
- [Prisma PostgreSQL Documentation](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)

## 🎉 Migration Complete!

Your HealthComm application is now running on Azure Database for PostgreSQL with:
- ✅ Scalable cloud database
- ✅ Automatic backups
- ✅ High availability
- ✅ Performance monitoring
- ✅ Security best practices

Start developing with `npm run dev` and deploy to Azure when ready!
