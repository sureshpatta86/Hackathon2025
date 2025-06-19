@echo off
REM HealthComm - Healthcare Communication System Startup Script
REM Simple batch file to start the application

echo ================================================================
echo  HEALTHCOMM - HEALTHCARE COMMUNICATION SYSTEM
echo ================================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist package.json (
    echo [ERROR] package.json not found. Make sure you're in the project directory.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo [INFO] Installing dependencies...
    npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Setup database
echo [INFO] Setting up database...
npx prisma generate
npx prisma db push

REM Display startup information
echo.
echo ================================================================
echo  STARTING HEALTHCOMM APPLICATION
echo ================================================================
echo.
echo ^🏥 HealthComm - Healthcare Communication System
echo ^🌐 Frontend: http://localhost:3000
echo ^🔧 API: http://localhost:3000/api
echo ^📱 Mode: Check .env file for MESSAGING_MODE
echo.
echo ^🚀 Starting development server...
echo Press Ctrl+C to stop the server
echo.

REM Start the application
npm run dev

echo.
echo ^👋 HealthComm application stopped
pause
