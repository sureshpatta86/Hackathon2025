# 🚀 HealthComm Startup Scripts

This directory contains multiple startup scripts to run the HealthComm Healthcare Communication System. Choose the method that works best for your operating system and preferences.

## �️ Database Migration to Azure PostgreSQL

**IMPORTANT**: The application has been migrated from SQLite to Azure Database for PostgreSQL for better scalability and production readiness.

### Quick Azure Setup:
```bash
# For macOS/Linux
npm run azure:setup

# For Windows
npm run azure:setup-windows
```

### Manual Azure Setup:
1. Follow the guide in `AZURE_POSTGRESQL_MIGRATION.md`
2. Create your Azure Database for PostgreSQL instance
3. Update your `.env.local` file with the connection string
4. Run migration: `npm run db:setup`

## �📁 Available Startup Methods

### 1. PowerShell Script (Windows) - `start.ps1` ⭐ **RECOMMENDED FOR WINDOWS**

**Features:**
- ✅ Comprehensive error checking
- ✅ Automatic dependency installation
- ✅ Database setup and seeding
- ✅ Messaging mode configuration
- ✅ Clean install options
- ✅ Colored output and progress indicators

**Usage:**
```powershell
# Basic start
.\start.ps1

# Install dependencies and start
.\start.ps1 -Install

# Clean install (removes node_modules first)
.\start.ps1 -Clean

# Start in live messaging mode
.\start.ps1 -Mode live

# Complete reset and setup
.\start.ps1 -Reset

# Get help
.\start.ps1 -Help
```

### 2. Shell Script (macOS/Linux) - `start.sh` ⭐ **RECOMMENDED FOR UNIX**

**Features:**
- ✅ Cross-platform compatibility (macOS, Linux)
- ✅ Automatic dependency management
- ✅ Database setup and migration
- ✅ Messaging mode switching
- ✅ Colored terminal output

**Usage:**
```bash
# Make executable (first time only)
chmod +x start.sh

# Basic start
./start.sh

# Install dependencies and start
./start.sh --install

# Clean install
./start.sh --clean

# Start in live messaging mode
./start.sh --mode live

# Complete reset
./start.sh --reset

# Get help
./start.sh --help
```

### 3. Batch File (Windows) - `start.bat` ⚡ **SIMPLE WINDOWS**

**Features:**
- ✅ Simple and lightweight
- ✅ Basic error checking
- ✅ Automatic dependency installation
- ✅ Database setup

**Usage:**
```cmd
# Double-click start.bat or run in Command Prompt
start.bat
```

### 4. NPM Scripts 📦 **CROSS-PLATFORM**

**Usage:**
```bash
# Full setup and start
npm run full-start

# Start in demo mode
npm run start:demo

# Start in live mode (real messaging)
npm run start:live

# Setup database only
npm run db:setup

# Reset database
npm run db:reset

# Regular development start
npm run dev
```

## 🎯 Quick Start Guide

### For Windows Users:
1. **Open PowerShell** as Administrator
2. **Navigate** to project directory: `cd path\to\hackton-2025`
3. **Run**: `.\start.ps1 -Install`
4. **Wait** for setup to complete
5. **Open browser**: http://localhost:3000

### For macOS/Linux Users:
1. **Open Terminal**
2. **Navigate** to project directory: `cd /path/to/hackton-2025`
3. **Run**: `./start.sh --install`
4. **Wait** for setup to complete
5. **Open browser**: http://localhost:3000

### For Any Platform (NPM):
1. **Open Terminal/Command Prompt**
2. **Navigate** to project directory
3. **Run**: `npm run full-start`
4. **Open browser**: http://localhost:3000

## ⚙️ Configuration Options

### Messaging Modes

**Demo Mode (Default):**
- ✅ Safe for testing
- ✅ No real messages sent
- ✅ Simulated delivery status
- ✅ No Twilio charges

**Live Mode:**
- ⚠️ Sends real SMS/voice messages
- ⚠️ Requires Twilio credentials
- ⚠️ Charges apply for messages
- ✅ Real delivery tracking

### Environment Setup

The scripts automatically handle:
- ✅ Node.js version checking
- ✅ NPM dependency installation
- ✅ Database generation and migration
- ✅ Environment file creation
- ✅ Prisma client generation

## 🔧 Troubleshooting

### Common Issues:

**"Node.js not found"**
- Install Node.js from https://nodejs.org/
- Restart terminal after installation

**"Permission denied" (Unix systems)**
- Run: `chmod +x start.sh`
- Or use: `bash start.sh`

**"PowerShell execution policy" (Windows)**
- Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Or right-click PowerShell → "Run as Administrator"

**"Port 3000 already in use"**
- Stop other processes using port 3000
- Or change port in next.config.ts

**Database errors**
- Clear any cached database connections
- Run with reset option: `.\start.ps1 -Reset`

## 🌐 Application URLs

Once started, access:
- **Frontend**: http://localhost:3000
- **Login Page**: http://localhost:3000/login
- **API Docs**: http://localhost:3000/api
- **Database Studio**: `npx prisma studio` (separate command)

## 📱 Default Credentials

- **Username**: `admin`
- **Password**: `admin`

## 🎨 Features Overview

- 🏥 **Patient Management**: Add, edit, view patient records
- 💬 **Messaging**: Send SMS and voice messages
- 📝 **Templates**: Create reusable message templates
- 📊 **Analytics**: View communication statistics
- 🔍 **History**: Track all communications
- ⚙️ **Settings**: Configure Twilio and messaging modes

## 🔒 Security Notes

- 🔐 Passwords are encrypted with bcrypt
- 🛡️ Environment variables protect sensitive data
- 🔑 Twilio credentials are securely stored
- 🚫 Demo mode prevents accidental charges

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review terminal output for specific error messages
3. Ensure all prerequisites are installed
4. Try the reset option to start fresh

---

**Happy Healthcare Communication! 🏥✨**
