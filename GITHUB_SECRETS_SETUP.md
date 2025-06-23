# GitHub Secrets Configuration Guide

This document explains how to configure GitHub secrets for automated deployment of the HealthComm application.

## Required Secrets

To enable automated deployment to Azure, you need to configure the following secrets in your GitHub repository:

### 🔐 **Repository Secrets Setup**

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

### 📋 **Required Secrets List**

#### 1. **Azure Deployment Secrets**
```
AZURE_CREDENTIALS
```
**Value**: JSON object with Azure service principal credentials
```json
{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "subscriptionId": "your-subscription-id",
  "tenantId": "your-tenant-id"
}
```

```
AZURE_RESOURCE_GROUP
```
**Value**: `healthcomm-rg`

#### 2. **Database Configuration**
```
DATABASE_URL
```
**Value**: Your Azure PostgreSQL connection string
```
postgresql://healthcomm_admin:YOUR_PASSWORD@healthcomm-db-server.postgres.database.azure.com:5432/healthcomm_db?sslmode=require
```

#### 3. **Twilio Configuration**
```
TWILIO_ACCOUNT_SID
```
**Value**: Your Twilio Account SID

```
TWILIO_AUTH_TOKEN
```
**Value**: Your Twilio Auth Token

```
TWILIO_PHONE_NUMBER
```
**Value**: Your Twilio phone number (e.g., +1234567890)

#### 4. **Application Configuration**
```
NEXT_PUBLIC_APP_NAME
```
**Value**: `HealthComm`

```
MESSAGING_MODE
```
**Value**: `demo` or `live`

## 🚀 **Setting Up Azure Service Principal**

1. **Create Service Principal**:
   ```bash
   az ad sp create-for-rbac \
     --name "healthcomm-github-actions" \
     --role contributor \
     --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/healthcomm-rg \
     --sdk-auth
   ```

2. **Copy the JSON output** and use it as the `AZURE_CREDENTIALS` secret.

## 🔄 **Deployment Process**

Once all secrets are configured:

1. **Push to GitHub**: Any push to the `main` branch will trigger deployment
2. **Automatic Build**: The application will be built with Next.js
3. **Azure Deployment**: The app will be deployed to Azure App Service
4. **Database Setup**: Environment variables will be configured automatically

## 🛠️ **Manual Database Setup** (if needed)

If the `DATABASE_URL` secret is not configured, you can set it manually:

1. Go to **Azure Portal** → **App Services** → **Your App** → **Configuration**
2. Add a new application setting:
   - **Name**: `DATABASE_URL`
   - **Value**: Your PostgreSQL connection string

## ⚠️ **Security Notes**

- Never commit secrets to your repository
- Use strong passwords for all services
- Regularly rotate your service principal credentials
- Monitor your Azure costs and usage

## 🧪 **Testing Deployment**

After setting up secrets, test the deployment:

1. Make a small change to your code
2. Push to the `main` branch
3. Check the Actions tab in GitHub for deployment status
4. Verify the app is running at your Azure URL

## 📞 **Support**

If you encounter issues:
1. Check the GitHub Actions logs for error details
2. Verify all secrets are correctly configured
3. Ensure your Azure resources are properly set up
4. Check Azure App Service logs for runtime issues
