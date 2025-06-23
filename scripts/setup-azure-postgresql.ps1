# Azure Database for PostgreSQL Setup Script for Windows
# This PowerShell script helps you set up Azure Database for PostgreSQL for the HealthComm application

param(
    [string]$ResourceGroup = "healthcomm-rg",
    [string]$ServerName = "healthcomm-db-server",
    [string]$DatabaseName = "healthcomm_db",
    [string]$AdminUser = "healthcomm_admin",
    [string]$Location = "centralindia",
    [string]$SkuName = "Standard_B1ms",
    [string]$StorageSize = "32",
    [switch]$Help
)

# Display help
if ($Help) {
    Write-Host @"
Azure Database for PostgreSQL Setup Script

Usage: .\setup-azure-postgresql.ps1 [OPTIONS]

Options:
  -ResourceGroup    Azure resource group name (default: healthcomm-rg)
  -ServerName       PostgreSQL server name (default: healthcomm-db-server)
  -DatabaseName     Database name (default: healthcomm_db)
  -AdminUser        Admin username (default: healthcomm_admin)
  -Location         Azure region (default: eastus)
  -SkuName          Server SKU (default: Standard_B1ms)
  -StorageSize      Storage size in GB (default: 32)
  -Help             Show this help message

Examples:
  .\setup-azure-postgresql.ps1
  .\setup-azure-postgresql.ps1 -ServerName "my-healthcomm-db" -Location "westus2"
"@
    exit 0
}

# Colors for output
$Colors = @{
    Red = [System.ConsoleColor]::Red
    Green = [System.ConsoleColor]::Green
    Yellow = [System.ConsoleColor]::Yellow
    Blue = [System.ConsoleColor]::Blue
    White = [System.ConsoleColor]::White
}

function Write-ColoredText {
    param(
        [string]$Text,
        [System.ConsoleColor]$Color = $Colors.White
    )
    $originalColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Host $Text
    $Host.UI.RawUI.ForegroundColor = $originalColor
}

function Test-AzureCLI {
    Write-ColoredText "🔍 Checking Azure CLI installation..." $Colors.Blue
    
    try {
        $azVersion = az version --output json 2>$null | ConvertFrom-Json
        if ($azVersion) {
            Write-ColoredText "✅ Azure CLI is installed (Version: $($azVersion.'azure-cli'))" $Colors.Green
            return $true
        }
    }
    catch {
        Write-ColoredText "❌ Azure CLI is not installed or not working properly" $Colors.Red
        Write-ColoredText "Please install Azure CLI from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" $Colors.Yellow
        return $false
    }
}

function Test-AzureLogin {
    Write-ColoredText "🔍 Checking Azure authentication..." $Colors.Blue
    
    try {
        $account = az account show --output json 2>$null | ConvertFrom-Json
        if ($account) {
            Write-ColoredText "✅ Authenticated as: $($account.user.name)" $Colors.Green
            return $true
        }
    }
    catch {
        Write-ColoredText "⚠️ Not logged in to Azure. Starting login process..." $Colors.Yellow
        az login
        return $true
    }
}

function New-ResourceGroup {
    Write-ColoredText "📦 Creating resource group: $ResourceGroup" $Colors.Blue
    
    try {
        az group create --name $ResourceGroup --location $Location --output none
        Write-ColoredText "✅ Resource group created successfully" $Colors.Green
    }
    catch {
        Write-ColoredText "❌ Failed to create resource group" $Colors.Red
        throw
    }
}

function New-PostgreSQLServer {
    param([string]$AdminPassword)
    
    Write-ColoredText "🗄️ Creating PostgreSQL server: $ServerName" $Colors.Blue
    Write-ColoredText "This may take several minutes..." $Colors.Yellow
    
    try {
        az postgres flexible-server create `
            --resource-group $ResourceGroup `
            --name $ServerName `
            --location $Location `
            --admin-user $AdminUser `
            --admin-password $AdminPassword `
            --version 15 `
            --sku-name $SkuName `
            --storage-size $StorageSize `
            --public-access "0.0.0.0" `
            --output none
        
        Write-ColoredText "✅ PostgreSQL server created successfully" $Colors.Green
    }
    catch {
        Write-ColoredText "❌ Failed to create PostgreSQL server" $Colors.Red
        throw
    }
}

function New-Database {
    Write-ColoredText "🗃️ Creating database: $DatabaseName" $Colors.Blue
    
    try {
        az postgres flexible-server db create `
            --resource-group $ResourceGroup `
            --server-name $ServerName `
            --database-name $DatabaseName `
            --output none
        
        Write-ColoredText "✅ Database created successfully" $Colors.Green
    }
    catch {
        Write-ColoredText "❌ Failed to create database" $Colors.Red
        throw
    }
}

function Set-FirewallRules {
    Write-ColoredText "🔥 Configuring firewall rules" $Colors.Blue
    
    try {
        # Allow Azure services
        az postgres flexible-server firewall-rule create `
            --resource-group $ResourceGroup `
            --name $ServerName `
            --rule-name "AllowAzureServices" `
            --start-ip-address "0.0.0.0" `
            --end-ip-address "0.0.0.0" `
            --output none
        
        # Get current public IP
        $publicIP = (Invoke-RestMethod -Uri "https://api.ipify.org").Trim()
        Write-ColoredText "Your public IP: $publicIP" $Colors.Yellow
        
        # Allow current IP
        az postgres flexible-server firewall-rule create `
            --resource-group $ResourceGroup `
            --name $ServerName `
            --rule-name "AllowCurrentIP" `
            --start-ip-address $publicIP `
            --end-ip-address $publicIP `
            --output none
        
        Write-ColoredText "✅ Firewall rules configured successfully" $Colors.Green
    }
    catch {
        Write-ColoredText "❌ Failed to configure firewall rules" $Colors.Red
        throw
    }
}

function Show-ConnectionInfo {
    param([string]$AdminPassword)
    
    Write-ColoredText "`n📋 Connection Information" $Colors.Blue
    Write-ColoredText "========================" $Colors.Blue
    Write-ColoredText "Server Name: $ServerName.postgres.database.azure.com" $Colors.White
    Write-ColoredText "Database: $DatabaseName" $Colors.White
    Write-ColoredText "Admin User: $AdminUser" $Colors.White
    Write-ColoredText "Port: 5432" $Colors.White
    Write-ColoredText "`nConnection String for .env.local:" $Colors.Yellow
    Write-ColoredText "DATABASE_URL=`"postgresql://$AdminUser`:$AdminPassword@$ServerName.postgres.database.azure.com:5432/$DatabaseName`?sslmode=require`"" $Colors.White
}

function Invoke-Migration {
    Write-ColoredText "`n🔄 Would you like to run the database migration now? (y/n): " $Colors.Blue -NoNewline
    $response = Read-Host
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        try {
            Write-ColoredText "📥 Installing dependencies..." $Colors.Blue
            npm install
            
            Write-ColoredText "🔧 Generating Prisma client..." $Colors.Blue
            npx prisma generate
            
            Write-ColoredText "⚠️ Please make sure you've updated your .env.local file with the correct DATABASE_URL" $Colors.Yellow
            Write-ColoredText "Press any key to continue with migration..." $Colors.Yellow
            [System.Console]::ReadKey() | Out-Null
            Write-Host ""
            
            Write-ColoredText "🚀 Running database migration..." $Colors.Blue
            npx prisma db push
            
            Write-ColoredText "🌱 Seeding database..." $Colors.Blue
            npm run db:seed
            
            Write-ColoredText "✅ Migration completed successfully!" $Colors.Green
        }
        catch {
            Write-ColoredText "❌ Migration failed: $($_.Exception.Message)" $Colors.Red
        }
    }
}

# Main execution
try {
    Write-ColoredText "🚀 Azure Database for PostgreSQL Setup" $Colors.Blue
    Write-ColoredText "======================================" $Colors.Blue
    
    # Check prerequisites
    if (-not (Test-AzureCLI)) {
        exit 1
    }
    
    if (-not (Test-AzureLogin)) {
        exit 1
    }
    
    # Display configuration
    Write-ColoredText "`n📝 Configuration:" $Colors.Yellow
    Write-ColoredText "Resource Group: $ResourceGroup" $Colors.White
    Write-ColoredText "Server Name: $ServerName" $Colors.White
    Write-ColoredText "Database Name: $DatabaseName" $Colors.White
    Write-ColoredText "Admin User: $AdminUser" $Colors.White
    Write-ColoredText "Location: $Location" $Colors.White
    
    Write-ColoredText "`nDo you want to proceed with these settings? (y/n): " $Colors.Yellow -NoNewline
    $proceed = Read-Host
    
    if ($proceed -eq 'y' -or $proceed -eq 'Y') {
        # Get admin password
        Write-ColoredText "`nPlease enter a strong password for the database admin user:" $Colors.Yellow
        $adminPassword = Read-Host -AsSecureString
        $adminPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminPassword))
        
        # Execute setup steps
        New-ResourceGroup
        New-PostgreSQLServer -AdminPassword $adminPasswordPlain
        New-Database
        Set-FirewallRules
        Show-ConnectionInfo -AdminPassword $adminPasswordPlain
        Invoke-Migration
        
        Write-ColoredText "`n🎉 Azure Database for PostgreSQL setup completed!" $Colors.Green
        Write-ColoredText "`nNext steps:" $Colors.Yellow
        Write-ColoredText "1. Update your .env.local file with the connection string" $Colors.White
        Write-ColoredText "2. Test the connection with: npx prisma studio" $Colors.White
        Write-ColoredText "3. Deploy your application to Azure App Service" $Colors.White
    }
    else {
        Write-ColoredText "Setup cancelled" $Colors.Yellow
        exit 0
    }
}
catch {
    Write-ColoredText "❌ Setup failed: $($_.Exception.Message)" $Colors.Red
    exit 1
}
