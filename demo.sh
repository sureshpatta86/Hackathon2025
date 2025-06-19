#!/bin/bash

echo "🏥 HealthComm Demo Setup"
echo "========================"
echo ""

# Check if the application is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Application not running. Please start with 'npm run dev' first."
    exit 1
fi

echo "✅ Application is running at http://localhost:3000"
echo ""

# Test the API endpoints
echo "🧪 Testing API endpoints..."

# Test patients endpoint
echo "📋 Testing /api/patients..."
patients_response=$(curl -s http://localhost:3000/api/patients)
if [[ $patients_response == *"firstName"* ]]; then
    echo "   ✅ Patients API working"
else
    echo "   ❌ Patients API not responding correctly"
fi

# Test templates endpoint
echo "📝 Testing /api/templates..."
templates_response=$(curl -s http://localhost:3000/api/templates)
if [[ $templates_response == *"name"* ]]; then
    echo "   ✅ Templates API working"
else
    echo "   ❌ Templates API not responding correctly"
fi

# Test communications endpoint
echo "💬 Testing /api/communications..."
comms_response=$(curl -s http://localhost:3000/api/communications)
if [[ $comms_response == *"["* ]]; then
    echo "   ✅ Communications API working"
else
    echo "   ❌ Communications API not responding correctly"
fi

echo ""
echo "🎯 Demo Features Available:"
echo "=========================="
echo ""
echo "1. 📊 Dashboard Tab:"
echo "   - View patient statistics"
echo "   - See SMS and Voice template counts"
echo "   - Browse recent patients with their preferences"
echo ""
echo "2. 📨 Send Message Tab:"
echo "   - Choose between SMS and Voice communication"
echo "   - Select from existing patients"
echo "   - Use pre-defined templates or custom messages"
echo "   - Real-time sending with demo mode (no Twilio required)"
echo ""
echo "3. 👥 Patients Tab:"
echo "   - Add new patients with contact information"
echo "   - Set SMS/Voice communication preferences"
echo "   - View all patients and their details"
echo ""
echo "4. 📋 Templates Tab:"
echo "   - Create new SMS and Voice message templates"
echo "   - Use dynamic variables like {firstName}, {appointmentDate}"
echo "   - View existing templates organized by type"
echo ""
echo "5. 📚 History Tab:"
echo "   - View all sent communications"
echo "   - Track delivery status"
echo "   - See timestamps and template usage"
echo ""
echo "🔧 Demo Data Included:"
echo "====================="
echo "• 3 Sample patients (John Doe, Jane Smith, Robert Johnson)"
echo "• 4 SMS templates (Appointment Reminder, Prescription Ready, etc.)"
echo "• 3 Voice templates (Appointment Confirmation, Test Results, etc.)"
echo ""
echo "💡 Tips for Demo:"
echo "================="
echo "• Try sending a message to see the demo mode in action"
echo "• Create a new template with variables"
echo "• Add a new patient and test different communication preferences"
echo "• Check the History tab to see sent communications"
echo ""
echo "🔑 Environment Setup:"
echo "===================="
if [[ -z "$TWILIO_ACCOUNT_SID" ]]; then
    echo "• Twilio: Demo mode (no real SMS/Voice calls)"
    echo "  To enable real Twilio: Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER"
else
    echo "• Twilio: Configured for real SMS/Voice calls"
fi
echo ""
echo "🚀 Ready for demo! Open http://localhost:3000 in your browser"
