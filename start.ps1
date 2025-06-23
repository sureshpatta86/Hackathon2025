# HealthComm - Healthcare Communication System Startup Script
# This script starts the complete application (frontend + backend)

param(
    [switch]$Clean,
    [switch]$Install,
    [switch]$Reset,
    [string]$Mode = "demo"
)

# Colors for output
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow
$Blue = [System.ConsoleColor]::Blue
$Cyan = [System.ConsoleColor]::Cyan

function Write-ColorOutput {
    param([string]$Message, [System.ConsoleColor]$Color = [System.ConsoleColor]::White)
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-ColorOutput "================================================================" $Cyan
    Write-ColorOutput " $Title" $Cyan
    Write-ColorOutput "================================================================" $Cyan
    Write-Host ""
}

function Check-Prerequisites {
    Write-Header "CHECKING PREREQUISITES"
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-ColorOutput "✓ Node.js version: $nodeVersion" $Green
    }
    catch {
        Write-ColorOutput "✗ Node.js is not installed or not in PATH" $Red
        Write-ColorOutput "Please install Node.js from https://nodejs.org/" $Yellow
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-ColorOutput "✓ npm version: $npmVersion" $Green
    }
    catch {
        Write-ColorOutput "✗ npm is not available" $Red
        exit 1
    }
    
    # Check if package.json exists
    if (Test-Path "package.json") {
        Write-ColorOutput "✓ package.json found" $Green
    }
    else {
        Write-ColorOutput "✗ package.json not found. Make sure you're in the project directory." $Red
        exit 1
    }
}

function Install-Dependencies {
    Write-Header "INSTALLING DEPENDENCIES"
    
    Write-ColorOutput "Installing npm packages..." $Yellow
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ Dependencies installed successfully" $Green
    }
    else {
        Write-ColorOutput "✗ Failed to install dependencies" $Red
        exit 1
    }
}

function Setup-Database {
    Write-Header "SETTING UP DATABASE"
    
    # Check if .env file exists
    if (-not (Test-Path ".env")) {
        Write-ColorOutput "Creating .env file..." $Yellow
        Copy-Item ".env.example" ".env" -ErrorAction SilentlyContinue
    }
    
    Write-ColorOutput "Generating Prisma client..." $Yellow
    npx prisma generate
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ Prisma client generated" $Green
    }
    else {
        Write-ColorOutput "✗ Failed to generate Prisma client" $Red
        exit 1
    }
    
    Write-ColorOutput "Setting up database..." $Yellow
    npx prisma db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ Database setup completed" $Green
    }
    else {
        Write-ColorOutput "✗ Failed to setup database" $Red
        exit 1
    }
    
    # Seed database if needed
    if (Test-Path "prisma/seed.ts" -or Test-Path "prisma/seed.js") {
        Write-ColorOutput "Seeding database..." $Yellow
        npx prisma db seed
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✓ Database seeded successfully" $Green
        }
        else {
            Write-ColorOutput "⚠ Database seeding failed or no seed script found" $Yellow
        }
    }
}

function Set-MessagingMode {
    param([string]$Mode)
    
    Write-Header "CONFIGURING MESSAGING MODE"
    
    if (Test-Path ".env") {
        $envContent = Get-Content ".env" -Raw
        
        if ($envContent -match "MESSAGING_MODE=.*") {
            $envContent = $envContent -replace "MESSAGING_MODE=.*", "MESSAGING_MODE=$Mode"
        }
        else {
            $envContent += "`nMESSAGING_MODE=$Mode"
        }
        
        Set-Content ".env" $envContent
        
        Write-ColorOutput "✓ Messaging mode set to: $Mode" $Green
        
        if ($Mode -eq "live") {
            Write-ColorOutput "⚠ LIVE MODE: Real messages will be sent via Twilio!" $Yellow
            Write-ColorOutput "Make sure your Twilio credentials are configured in .env" $Yellow
        }
        else {
            Write-ColorOutput "✓ DEMO MODE: Messages will be simulated (no real SMS/calls)" $Green
        }
    }
    else {
        Write-ColorOutput "✗ .env file not found" $Red
        exit 1
    }
}

function Reset-Application {
    Write-Header "RESETTING APPLICATION"
    
    Write-ColorOutput "Removing node_modules..." $Yellow
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    
    Write-ColorOutput "Removing package-lock.json..." $Yellow
    Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
    
    Write-ColorOutput "Removing database..." $Yellow
    # Remove old database files are no longer needed with Azure PostgreSQL
    
    Write-ColorOutput "✓ Application reset completed" $Green
}

function Start-Application {
    Write-Header "STARTING HEALTHCOMM APPLICATION"
    
    Write-ColorOutput "🏥 HealthComm - Healthcare Communication System" $Cyan
    Write-ColorOutput "🌐 Frontend: http://localhost:3000" $Blue
    Write-ColorOutput "🔧 API: http://localhost:3000/api" $Blue
    Write-ColorOutput "📱 Mode: $Mode" $Blue
    Write-Host ""
    Write-ColorOutput "🚀 Starting development server..." $Green
    Write-ColorOutput "Press Ctrl+C to stop the server" $Yellow
    Write-Host ""
    
    # Start the Next.js development server
    npm run dev
}

function Show-Help {
    Write-Header "HEALTHCOMM STARTUP SCRIPT"
    
    Write-Host "Usage: .\start.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Install    Install dependencies before starting"
    Write-Host "  -Clean      Clean install (remove node_modules first)"
    Write-Host "  -Reset      Reset entire application (database, dependencies)"
    Write-Host "  -Mode       Set messaging mode: 'demo' or 'live' (default: demo)"
    Write-Host "  -Help       Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\start.ps1                    # Start with current settings"
    Write-Host "  .\start.ps1 -Install           # Install dependencies and start"
    Write-Host "  .\start.ps1 -Mode live         # Start in live messaging mode"
    Write-Host "  .\start.ps1 -Clean -Mode demo  # Clean install and start in demo mode"
    Write-Host "  .\start.ps1 -Reset             # Complete reset and setup"
    Write-Host ""
    Write-Host "Messaging Modes:"
    Write-Host "  demo - Simulate messages (safe for testing)"
    Write-Host "  live - Send real SMS/voice via Twilio (requires credentials)"
    Write-Host ""
}

# Main execution
try {
    if ($args -contains "-Help" -or $args -contains "--help" -or $args -contains "-h") {
        Show-Help
        exit 0
    }
    
    Write-Header "HEALTHCOMM - HEALTHCARE COMMUNICATION SYSTEM"
    Write-ColorOutput "Starting HealthComm application..." $Cyan
    
    # Handle reset option
    if ($Reset) {
        Reset-Application
        $Install = $true  # Force install after reset
    }
    
    # Check prerequisites
    Check-Prerequisites
    
    # Handle clean install
    if ($Clean) {
        Write-ColorOutput "Performing clean install..." $Yellow
        Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
        Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
        $Install = $true
    }
    
    # Install dependencies if requested or if node_modules doesn't exist
    if ($Install -or -not (Test-Path "node_modules")) {
        Install-Dependencies
    }
    
    # Setup database
    Setup-Database
    
    # Set messaging mode
    Set-MessagingMode -Mode $Mode
    
    # Start the application
    Start-Application
}
catch {
    Write-Host ""
    Write-ColorOutput "✗ An error occurred: $_" $Red
    Write-ColorOutput "Run '.\start.ps1 -Help' for usage information" $Yellow
    exit 1
}
finally {
    Write-Host ""
    Write-ColorOutput "👋 HealthComm application stopped" $Yellow
}
