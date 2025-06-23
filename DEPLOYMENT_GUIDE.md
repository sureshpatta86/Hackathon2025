# GitHub Actions Deployment Setup for Azure

## Overview
This guide will help you deploy your Next.js application with Prisma and Azure PostgreSQL to Azure Web App using GitHub Actions.

## Prerequisites
✅ Azure Resource Group: `rg-hackathon-2025`
✅ Azure Web App: `healthcomm`
✅ Azure CLI installed and configured
✅ Service Principal created

## Step 1: Add GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** and add these secrets:

### Required Secrets:

1. **AZURE_CREDENTIALS**
```json
{
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET", 
  "subscriptionId": "YOUR_SUBSCRIPTION_ID",
  "tenantId": "YOUR_TENANT_ID",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```
**Note:** Use the actual JSON output from the service principal creation command above.

2. **AZURE_WEBAPP_NAME**: `healthcomm`

3. **AZURE_RESOURCE_GROUP**: `rg-hackathon-2025`

4. **Environment Variables from your .env:**
   - **TWILIO_ACCOUNT_SID**: `YOUR_TWILIO_ACCOUNT_SID`
   - **TWILIO_AUTH_TOKEN**: `YOUR_TWILIO_AUTH_TOKEN`
   - **TWILIO_PHONE_NUMBER**: `YOUR_TWILIO_PHONE_NUMBER`
   - **NEXT_PUBLIC_APP_NAME**: `HealthComm`
   - **MESSAGING_MODE**: `live`

## Step 2: Configure Azure Web App Runtime

Ensure your Azure Web App is configured for Node.js:

```bash
# Set Node.js version
az webapp config set --resource-group rg-hackathon-2025 --name healthcomm --linux-fx-version "NODE|18-lts"

# Enable logging
az webapp log config --resource-group rg-hackathon-2025 --name healthcomm --application-logging filesystem --level information
```

## Step 3: Deployment Process

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:

1. ✅ Checkout code
2. ✅ Set up Node.js 18.x
3. ✅ Install dependencies with `npm ci`
4. ✅ Generate Prisma client
5. ✅ Setup Azure PostgreSQL database connection
6. ✅ Build Next.js application
7. ✅ Deploy to Azure Web App
8. ✅ Configure environment variables in Azure

## Step 4: Trigger Deployment

1. Commit and push your changes to the `main` branch
2. GitHub Actions will automatically trigger the deployment
3. Monitor the deployment in the **Actions** tab of your GitHub repository
4. Your app will be available at: `https://healthcomm.azurewebsites.net`

## Step 5: Verify Deployment

After deployment, you can:

1. Check deployment logs:
```bash
az webapp log tail --resource-group rg-hackathon-2025 --name healthcomm
```

2. Test your application:
```bash
curl https://healthcomm.azurewebsites.net
```

3. View Azure Web App settings:
```bash
az webapp config appsettings list --resource-group rg-hackathon-2025 --name healthcomm
```

## Troubleshooting

### If deployment fails:
1. Check GitHub Actions logs in the Actions tab
2. Verify all secrets are correctly set
3. Check Azure Web App logs
4. Ensure your web app has sufficient resources

### Common issues:
- **Build failures**: Check Node.js version compatibility
- **Database issues**: Verify Prisma schema and migrations
- **Environment variables**: Ensure all required secrets are set

## Security Notes

⚠️ **Important**: The service principal credentials above have been shared in this document. For production use:
1. Rotate the client secret regularly
2. Use minimal required permissions
3. Monitor service principal usage
4. Consider using managed identities for enhanced security

## Next Steps

1. Add the GitHub secrets as listed above
2. Push your code to trigger the first deployment
3. Monitor the deployment process
4. Test your application functionality

Your deployment pipeline is now ready! 🚀
