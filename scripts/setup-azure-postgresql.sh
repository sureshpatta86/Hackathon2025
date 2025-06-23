#!/bin/bash

# Azure Database for PostgreSQL Setup Script
# This script helps you set up Azure Database for PostgreSQL for the HealthComm application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
RESOURCE_GROUP="healthcomm-rg"
SERVER_NAME="healthcomm-db-server"
DATABASE_NAME="healthcomm_db"
ADMIN_USER="healthcomm_admin"
LOCATION="centralindia"
SKU_NAME="standard_d2s_v3"
STORAGE_SIZE="32"

echo -e "${BLUE}🚀 Azure Database for PostgreSQL Setup${NC}"
echo -e "${BLUE}======================================${NC}"

# Function to check if Azure CLI is installed
check_azure_cli() {
    if ! command -v az &> /dev/null; then
        echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
        echo -e "${YELLOW}Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Azure CLI is installed${NC}"
}

# Function to check if user is logged in
check_azure_login() {
    if ! az account show &> /dev/null; then
        echo -e "${YELLOW}⚠️  You are not logged in to Azure. Please log in...${NC}"
        az login
    fi
    echo -e "${GREEN}✅ Azure CLI is authenticated${NC}"
}

# Function to check/create resource group
create_resource_group() {
    echo -e "${BLUE}📦 Checking resource group: $RESOURCE_GROUP${NC}"
    
    # Check if resource group exists
    if az group show --name $RESOURCE_GROUP &>/dev/null; then
        echo -e "${GREEN}✅ Resource group already exists${NC}"
    else
        echo -e "${BLUE}📦 Creating resource group: $RESOURCE_GROUP${NC}"
        az group create --name $RESOURCE_GROUP --location $LOCATION
        echo -e "${GREEN}✅ Resource group created${NC}"
    fi
}

# Function to create PostgreSQL server
create_postgresql_server() {
    echo -e "${BLUE}🗄️  Creating PostgreSQL server: $SERVER_NAME${NC}"
    
    # Prompt for admin password
    echo -e "${YELLOW}Please enter a strong password for the database admin user:${NC}"
    read -s ADMIN_PASSWORD
    echo
    
    az postgres flexible-server create \
        --resource-group $RESOURCE_GROUP \
        --name $SERVER_NAME \
        --location $LOCATION \
        --admin-user $ADMIN_USER \
        --admin-password $ADMIN_PASSWORD \
        --version 15 \
        --tier Burstable \
        --sku-name Standard_B1ms \
        --storage-size $STORAGE_SIZE \
        --public-access 0.0.0.0
    
    echo -e "${GREEN}✅ PostgreSQL server created${NC}"
}

# Function to create database
create_database() {
    echo -e "${BLUE}🗃️  Creating database: $DATABASE_NAME${NC}"
    az postgres flexible-server db create \
        --resource-group $RESOURCE_GROUP \
        --server-name $SERVER_NAME \
        --database-name $DATABASE_NAME
    echo -e "${GREEN}✅ Database created${NC}"
}

# Function to configure firewall rules
configure_firewall() {
    echo -e "${BLUE}🔥 Configuring firewall rules${NC}"
    
    # Allow Azure services
    az postgres flexible-server firewall-rule create \
        --resource-group $RESOURCE_GROUP \
        --name $SERVER_NAME \
        --rule-name AllowAzureServices \
        --start-ip-address 0.0.0.0 \
        --end-ip-address 0.0.0.0
    
    # Get current public IP
    PUBLIC_IP=$(curl -s ifconfig.me)
    echo -e "${YELLOW}Your public IP: $PUBLIC_IP${NC}"
    
    # Allow current IP
    az postgres flexible-server firewall-rule create \
        --resource-group $RESOURCE_GROUP \
        --name $SERVER_NAME \
        --rule-name AllowCurrentIP \
        --start-ip-address $PUBLIC_IP \
        --end-ip-address $PUBLIC_IP
    
    echo -e "${GREEN}✅ Firewall rules configured${NC}"
}

# Function to display connection information
display_connection_info() {
    echo -e "${BLUE}📋 Connection Information${NC}"
    echo -e "${BLUE}========================${NC}"
    echo -e "${YELLOW}Server Name:${NC} $SERVER_NAME.postgres.database.azure.com"
    echo -e "${YELLOW}Database:${NC} $DATABASE_NAME"
    echo -e "${YELLOW}Admin User:${NC} $ADMIN_USER"
    echo -e "${YELLOW}Port:${NC} 5432"
    echo
    echo -e "${YELLOW}Connection String for .env.local:${NC}"
    echo "DATABASE_URL=\"postgresql://$ADMIN_USER:YOUR_PASSWORD@$SERVER_NAME.postgres.database.azure.com:5432/$DATABASE_NAME?sslmode=require\""
    echo
    echo -e "${RED}⚠️  Remember to replace YOUR_PASSWORD with the actual password you entered${NC}"
}

# Function to run database migration
run_migration() {
    echo -e "${BLUE}🔄 Would you like to run the database migration now? (y/n)${NC}"
    read -p "" -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}📥 Installing dependencies...${NC}"
        npm install
        
        echo -e "${BLUE}🔧 Generating Prisma client...${NC}"
        npx prisma generate
        
        echo -e "${YELLOW}Please make sure you've updated your .env.local file with the correct DATABASE_URL${NC}"
        echo -e "${YELLOW}Press any key to continue with migration...${NC}"
        read -n 1 -s
        
        echo -e "${BLUE}🚀 Running database migration...${NC}"
        npx prisma db push
        
        echo -e "${BLUE}🌱 Seeding database...${NC}"
        npm run db:seed
        
        echo -e "${GREEN}✅ Migration completed successfully!${NC}"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}Starting Azure Database for PostgreSQL setup...${NC}"
    echo
    
    check_azure_cli
    check_azure_login
    
    echo -e "${YELLOW}📝 Configuration:${NC}"
    echo -e "Resource Group: $RESOURCE_GROUP"
    echo -e "Server Name: $SERVER_NAME"
    echo -e "Database Name: $DATABASE_NAME"
    echo -e "Admin User: $ADMIN_USER"
    echo -e "Location: $LOCATION"
    echo
    
    echo -e "${YELLOW}Do you want to proceed with these settings? (y/n)${NC}"
    read -p "" -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_resource_group
        create_postgresql_server
        create_database
        configure_firewall
        display_connection_info
        run_migration
        
        echo
        echo -e "${GREEN}🎉 Azure Database for PostgreSQL setup completed!${NC}"
        echo -e "${YELLOW}Next steps:${NC}"
        echo -e "1. Update your .env.local file with the connection string"
        echo -e "2. Test the connection with: npx prisma studio"
        echo -e "3. Deploy your application to Azure App Service"
    else
        echo -e "${YELLOW}Setup cancelled${NC}"
        exit 0
    fi
}

# Run the main function
main
