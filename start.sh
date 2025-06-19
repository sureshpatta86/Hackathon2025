#!/bin/bash

# HealthComm - Healthcare Communication System Startup Script
# Shell script for Unix-like systems (macOS, Linux)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to print headers
print_header() {
    echo ""
    print_color $CYAN "================================================================"
    print_color $CYAN " $1"
    print_color $CYAN "================================================================"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    print_header "CHECKING PREREQUISITES"
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_color $GREEN "✓ Node.js version: $NODE_VERSION"
    else
        print_color $RED "✗ Node.js is not installed or not in PATH"
        print_color $YELLOW "Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_color $GREEN "✓ npm version: $NPM_VERSION"
    else
        print_color $RED "✗ npm is not available"
        exit 1
    fi
    
    # Check if package.json exists
    if [ -f "package.json" ]; then
        print_color $GREEN "✓ package.json found"
    else
        print_color $RED "✗ package.json not found. Make sure you're in the project directory."
        exit 1
    fi
}

# Function to install dependencies
install_dependencies() {
    print_header "INSTALLING DEPENDENCIES"
    
    print_color $YELLOW "Installing npm packages..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_color $GREEN "✓ Dependencies installed successfully"
    else
        print_color $RED "✗ Failed to install dependencies"
        exit 1
    fi
}

# Function to setup database
setup_database() {
    print_header "SETTING UP DATABASE"
    
    # Create .env if it doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_color $YELLOW "Creating .env file from template..."
            cp .env.example .env
        fi
    fi
    
    print_color $YELLOW "Generating Prisma client..."
    npx prisma generate
    
    if [ $? -eq 0 ]; then
        print_color $GREEN "✓ Prisma client generated"
    else
        print_color $RED "✗ Failed to generate Prisma client"
        exit 1
    fi
    
    print_color $YELLOW "Setting up database..."
    npx prisma db push
    
    if [ $? -eq 0 ]; then
        print_color $GREEN "✓ Database setup completed"
    else
        print_color $RED "✗ Failed to setup database"
        exit 1
    fi
    
    # Seed database if seed file exists
    if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
        print_color $YELLOW "Seeding database..."
        npx prisma db seed
        
        if [ $? -eq 0 ]; then
            print_color $GREEN "✓ Database seeded successfully"
        else
            print_color $YELLOW "⚠ Database seeding failed or no seed script found"
        fi
    fi
}

# Function to set messaging mode
set_messaging_mode() {
    local mode=${1:-demo}
    
    print_header "CONFIGURING MESSAGING MODE"
    
    if [ -f ".env" ]; then
        # Update or add MESSAGING_MODE in .env
        if grep -q "MESSAGING_MODE=" .env; then
            sed -i.bak "s/MESSAGING_MODE=.*/MESSAGING_MODE=$mode/" .env
        else
            echo "MESSAGING_MODE=$mode" >> .env
        fi
        
        print_color $GREEN "✓ Messaging mode set to: $mode"
        
        if [ "$mode" = "live" ]; then
            print_color $YELLOW "⚠ LIVE MODE: Real messages will be sent via Twilio!"
            print_color $YELLOW "Make sure your Twilio credentials are configured in .env"
        else
            print_color $GREEN "✓ DEMO MODE: Messages will be simulated (no real SMS/calls)"
        fi
    else
        print_color $RED "✗ .env file not found"
        exit 1
    fi
}

# Function to start the application
start_application() {
    print_header "STARTING HEALTHCOMM APPLICATION"
    
    print_color $CYAN "🏥 HealthComm - Healthcare Communication System"
    print_color $BLUE "🌐 Frontend: http://localhost:3000"
    print_color $BLUE "🔧 API: http://localhost:3000/api"
    print_color $BLUE "📱 Mode: $(grep MESSAGING_MODE .env 2>/dev/null || echo 'demo')"
    echo ""
    print_color $GREEN "🚀 Starting development server..."
    print_color $YELLOW "Press Ctrl+C to stop the server"
    echo ""
    
    # Start the Next.js development server
    npm run dev
}

# Function to show help
show_help() {
    print_header "HEALTHCOMM STARTUP SCRIPT"
    
    echo "Usage: ./start.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -i, --install       Install dependencies before starting"
    echo "  -c, --clean         Clean install (remove node_modules first)"
    echo "  -r, --reset         Reset entire application (database, dependencies)"
    echo "  -m, --mode MODE     Set messaging mode: 'demo' or 'live' (default: demo)"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./start.sh                    # Start with current settings"
    echo "  ./start.sh --install          # Install dependencies and start"
    echo "  ./start.sh --mode live        # Start in live messaging mode"
    echo "  ./start.sh --clean --mode demo # Clean install and start in demo mode"
    echo "  ./start.sh --reset            # Complete reset and setup"
    echo ""
    echo "Messaging Modes:"
    echo "  demo - Simulate messages (safe for testing)"
    echo "  live - Send real SMS/voice via Twilio (requires credentials)"
    echo ""
}

# Parse command line arguments
INSTALL=false
CLEAN=false
RESET=false
MODE="demo"

while [[ $# -gt 0 ]]; do
    case $1 in
        -i|--install)
            INSTALL=true
            shift
            ;;
        -c|--clean)
            CLEAN=true
            INSTALL=true
            shift
            ;;
        -r|--reset)
            RESET=true
            INSTALL=true
            shift
            ;;
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_color $RED "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_header "HEALTHCOMM - HEALTHCARE COMMUNICATION SYSTEM"
    print_color $CYAN "Starting HealthComm application..."
    
    # Handle reset option
    if [ "$RESET" = true ]; then
        print_color $YELLOW "Resetting application..."
        rm -rf node_modules package-lock.json prisma/dev.db prisma/dev.db-journal
        print_color $GREEN "✓ Application reset completed"
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Handle clean install
    if [ "$CLEAN" = true ]; then
        print_color $YELLOW "Performing clean install..."
        rm -rf node_modules package-lock.json
    fi
    
    # Install dependencies if requested or if node_modules doesn't exist
    if [ "$INSTALL" = true ] || [ ! -d "node_modules" ]; then
        install_dependencies
    fi
    
    # Setup database
    setup_database
    
    # Set messaging mode
    set_messaging_mode "$MODE"
    
    # Start the application
    start_application
}

# Error handling
trap 'echo ""; print_color $YELLOW "👋 HealthComm application stopped"' EXIT

# Run main function
main "$@"
