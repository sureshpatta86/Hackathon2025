# HealthComm - Healthcare Communication System

A comprehensive healthcare communication platform built with Next.js, Prisma, and Twilio for managing patient communications via SMS and voice calls with real-time messaging, template variables, and complete CRUD operations.

## 🌟 Features

### 📱 **Communication Management**
- **Real SMS/Voice Messaging**: Send actual messages via Twilio integration
- **Demo Mode**: Test functionality without sending real messages
- **International Phone Support**: Works with global phone numbers (+1, +91, etc.)
- **Message Status Tracking**: Real-time delivery confirmation and error handling
- **Communication History**: Complete audit trail of all sent messages

### 👥 **Patient Management**
- **Complete CRUD Operations**: Create, Read, Update, Delete patients
- **Patient Profiles**: Store contact info, preferences, and medical notes
- **SMS/Voice Preferences**: Individual communication preferences per patient
- **Search & Filter**: Easy patient lookup and management
- **Bulk Operations**: Efficient management of multiple patients

### 📝 **Advanced Template System**
- **Dynamic Template Variables**: Auto-replace placeholders with real patient data
- **Template CRUD**: Create, edit, and delete message templates
- **Variable Helper**: Interactive guide showing available template variables
- **SMS & Voice Templates**: Separate templates for different communication types
- **Real-time Preview**: See how templates will look with actual data

### 📊 **Analytics & Reporting**
- **Delivery Analytics**: Success rates, failed messages, and performance metrics
- **Communication Trends**: Daily activity patterns and usage statistics
- **Patient Engagement**: Track communication frequency per patient
- **Error Analysis**: Detailed failure reasons and troubleshooting

### 🎯 **Appointment Integration**
- **Appointment Scheduling**: Create and manage patient appointments
- **Template Variables**: Automatic appointment data in message templates
- **Reminder System**: Automated appointment reminders
- **Status Tracking**: Monitor appointment confirmations and changes

### ⚙️ **System Configuration**
- **Settings Management**: Easy configuration of Twilio credentials
- **Mode Switching**: Toggle between Demo and Live messaging modes
- **Environment Management**: Secure credential storage and management
- **System Health**: Real-time status indicators and configuration validation

## 🛠 Tech Stack

- **Frontend**: Next.js 15.3.4, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server-side validation
- **Database**: Azure PostgreSQL with Prisma ORM v5+
- **Communication**: Twilio SDK (SMS & Voice API)
- **UI Components**: Custom components with Lucide React icons
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Session-based authentication system

## 🚀 Quick Start

### 📋 Prerequisites

- **Node.js 18+** installed
- **npm** or **yarn** package manager
- **Twilio account** (free tier available at [twilio.com](https://www.twilio.com))

### 🔧 Installation

#### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd hackton-2025

# Run the automated startup script
./start.sh --install --mode live

# Or on Windows
.\start.ps1 -Install -Mode live
```

#### Option 2: Manual Setup

```bash
# 1. Clone and install dependencies
git clone <repository-url>
cd hackton-2025
npm install

# 2. Set up the database
npx prisma generate
npx prisma db push

# 3. Seed with sample data
npx prisma db seed

# 4. Start development server
npm run dev
```

### 🔐 Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://healthcomm_admin:password@healthcomm-db-server.postgres.database.azure.com:5432/healthcomm_db?sslmode=require"
```env
# Database
DATABASE_URL="postgresql://DB_USER:DB_PASSWORD@DB_HOST:5432/DB_NAME?sslmode=require"

# Twilio Configuration (Get from https://console.twilio.com/)
TWILIO_ACCOUNT_SID=your_account_sid_here
# Application Settings
NEXT_PUBLIC_APP_NAME="HealthComm"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Messaging Mode: "demo" or "live"
# demo = simulated messages (no real SMS/calls sent)
# live = real messages via Twilio (requires valid credentials)
```

### 🎯 Getting Your Twilio Credentials

1. **Sign up** at [twilio.com](https://www.twilio.com) (free trial available)
2. **Get Account SID** from the Twilio Console dashboard
3. **Get Auth Token** from the Twilio Console dashboard  
4. **Buy a Phone Number** or use the trial number provided
5. **Copy credentials** to your `.env` file

### 🚀 First Run

1. **Start the application**:
   ```bash
   npm run dev
   # or
   ./start.sh
   ```

2. **Open your browser** to [http://localhost:3000](http://localhost:3000)

3. **Login with default credentials**:
   - Username: `admin`
   - Password: `admin`

4. **Test the system**:
   - Add a patient with your phone number
   - Send yourself a test SMS
   - Check the Communications History

## 📱 Usage Guide

### 🏥 Dashboard Overview

The main dashboard provides:
- **Live Mode Indicator**: Shows if real messaging is enabled
- **Quick Stats**: Patient count, recent communications, system status
- **Navigation Tabs**: Easy access to all system features

### 👤 Patient Management

**Adding a Patient:**
1. Go to **Patients** tab
2. Click **Add New Patient**
3. Fill in required information:
   - First Name, Last Name (required)
   - Phone Number with country code (e.g., +918374026999)
   - Email (optional)
   - SMS/Voice preferences
4. Click **Add Patient**

**Editing a Patient:**
1. Find the patient in the list
2. Click the **✏️ Edit** button
3. Update information in the modal
4. Click **💾 Update Patient**

**Deleting a Patient:**
1. Find the patient in the list
2. Click the **🗑️ Delete** button
3. Confirm deletion in the dialog

### 📝 Template Management

**Available Template Variables:**
- `{firstName}` - Patient's first name
- `{lastName}` - Patient's last name
- `{fullName}` - Patient's full name
- `{phoneNumber}` - Patient's phone number
- `{email}` - Patient's email address
- `{appointmentDate}` - Appointment date (e.g., Monday, June 20, 2025)
- `{appointmentTime}` - Appointment time (e.g., 2:30 PM)
- `{appointmentDateTime}` - Full date and time
- `{appointmentTitle}` - Appointment title/type
- `{appointmentDescription}` - Appointment description
- `{clinicName}` - Clinic name (configurable)
- `{providerName}` - Healthcare provider name
- `{clinicPhone}` - Clinic phone number

**Creating a Template:**
1. Go to **Templates** tab
2. Click **Add New Template**
3. Enter template details:
   - Name (e.g., "Appointment Reminder")
   - Type (SMS or Voice)
   - Content with variables (e.g., "Hi {firstName}, your appointment is on {appointmentDate}")
4. Click **Add Template**

**Example Templates:**
```
Appointment Reminder:
Hi {firstName}, this is a reminder about your {appointmentTitle} appointment on {appointmentDate} at {appointmentTime}. Please call {clinicPhone} if you need to reschedule.

Lab Results Ready:
Hello {fullName}, your lab results are ready. Please call {clinicPhone} to schedule a follow-up appointment.

Medication Reminder:
Hi {firstName}, this is a reminder to take your prescribed medication. Contact us at {clinicPhone} if you have any questions.
```

### 💬 Sending Messages

**Quick Message:**
1. Go to **Send Message** tab
2. Select a patient from the dropdown
3. Choose message type (SMS or Voice)
4. Either:
   - Select a template (auto-fills with variables)
   - Write a custom message
5. Click **Send Message**

**Template Message:**
1. Select a template from the dropdown
2. Preview shows how variables will be replaced
3. Optionally edit the message
4. Send to patient

### 📊 Analytics & Monitoring

**Communication History:**
- View all sent messages with status
- Filter by patient, date, or message type
- See delivery confirmation and error details
- Export communication logs

**Analytics Dashboard:**
- Message success rates
- Daily communication trends
- Top communicating patients
- Failed message analysis
- System performance metrics

### ⚙️ System Configuration

**Settings Page:**
- View current messaging mode (Demo/Live)
- Check Twilio configuration status
- See account details and phone number
- Toggle between modes (requires restart)

## 🔧 Development

### 📁 Project Structure

```
hackton-2025/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── patients/      # Patient CRUD operations
│   │   │   ├── templates/     # Template management
│   │   │   ├── communications/# Messaging endpoints
│   │   │   ├── appointments/  # Appointment management
│   │   │   ├── analytics/     # Analytics data
│   │   │   └── settings/      # System configuration
│   │   ├── dashboard/         # Main dashboard page
│   │   ├── login/            # Authentication page
│   │   └── globals.css       # Global styles
│   ├── components/           # Reusable components
│   │   ├── ui/              # UI components
│   │   ├── AuthWrapper.tsx  # Authentication wrapper
│   │   └── Navigation.tsx   # Navigation component
│   ├── lib/                 # Utility libraries
│   │   ├── db.ts           # Database connection
│   │   ├── messaging.ts    # Twilio integration
│   │   └── templateVariables.ts # Template processing
│   └── prisma/             # Database schema and migrations
├── public/                 # Static assets
├── scripts/               # Utility scripts
│   ├── start.sh          # Unix startup script
│   ├── start.ps1         # PowerShell startup script
│   └── start.bat         # Batch startup script
└── docs/                 # Documentation
```

### 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:push         # Push schema changes
npm run db:seed         # Seed with sample data
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset and reseed database

# Enhanced Scripts
npm run full-start      # Complete setup and start
npm run start:live      # Start in live messaging mode
npm run start:demo      # Start in demo mode

# Startup Scripts (Cross-platform)
./start.sh --help       # Show all options
./start.sh --install    # Install dependencies
./start.sh --mode live  # Start in live mode
./start.sh --clean      # Clean install
./start.sh --reset      # Complete reset
```

### 🔍 API Endpoints

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

**Patients:**
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create new patient
- `PUT /api/patients` - Update existing patient
- `DELETE /api/patients?id={id}` - Delete patient

**Templates:**
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create new template
- `PUT /api/templates` - Update existing template
- `DELETE /api/templates?id={id}` - Delete template

**Communications:**
- `GET /api/communications` - List communication history
- `POST /api/communications` - Send new message

**Appointments:**
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment

**Analytics:**
- `GET /api/analytics?days={n}` - Get analytics data

**Settings:**
- `GET /api/settings` - Get system configuration

### 📊 Database Schema

**Key Models:**
- **Patient**: Store patient information and preferences
- **Template**: Message templates with variables
- **Communication**: Message history and delivery status
- **Appointment**: Appointment scheduling and tracking

**Relationships:**
- Patient → Communications (one-to-many)
- Patient → Appointments (one-to-many)
- Template → Communications (one-to-many, optional)
- Appointment → Communications (one-to-many, optional)

## 🎯 Production Deployment

### 🌐 Deployment Checklist

1. **Environment Variables**:
   - Set production Twilio credentials
   - Configure database URL
   - Set secure session secrets

2. **Database**:
   - Migrate to production database (PostgreSQL recommended)
   - Run migrations and seeding

3. **Security**:
   - Enable HTTPS
   - Set strong authentication credentials
   - Configure CORS policies

4. **Monitoring**:
   - Set up error tracking
   - Monitor Twilio usage and costs
   - Configure logging and analytics

### 💰 Cost Considerations

**Twilio Pricing (Approximate):**
- SMS: ~$0.0075 per message
- Voice: ~$0.0130 per minute
- Monthly phone number: ~$1.00

**Free Tier:**
- $15.50 trial credit on new accounts
- Enough for extensive testing and small deployments

## 🛠 Troubleshooting

### 🚨 Common Issues

**"Invalid phone number" errors:**
- Ensure phone numbers include country code (+1, +91, etc.)
- Check Twilio console for supported countries
- Verify phone number format in Twilio dashboard

**Messages not sending:**
- Check MESSAGING_MODE is set to "live"
- Verify Twilio credentials in .env file
- Ensure sufficient Twilio account balance
- Check Communications History for error details

**Database connection issues:**
- Run `npx prisma generate`
- Try `npx prisma db push` to sync schema
- Check DATABASE_URL in .env file

**Port conflicts:**
- Default port 3000, automatically switches to 3001 if occupied
- Use `lsof -i :3000` to check port usage

### 🔧 Development Tips

**Hot Reloading:**
- The development server supports hot reloading
- Changes to API routes require server restart
- Database schema changes need `npx prisma db push`

**Testing:**
- Use Demo mode for development testing
- Test with your own phone number first
- Monitor Twilio console for message logs

**Debugging:**
- Check browser console for frontend errors
- Check terminal logs for backend errors
- Use Prisma Studio for database inspection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (both demo and live modes)
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review Twilio documentation
- Open an issue in the repository

---

## 🎉 Quick Demo

**Ready to see it in action?**

1. **Start the app**: `./start.sh --mode live`
2. **Login**: Use `admin/admin`
3. **Add yourself as a patient** with your phone number
4. **Create a template**: "Hi {firstName}, welcome to {clinicName}!"
5. **Send a message** and check your phone!

**Your healthcare communication system is ready! 🚀📱**
- `POST /api/communications/voice` - Make voice call

### Templates
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create new template

### Appointments
- `GET /api/appointments` - List all appointments
- `POST /api/appointments` - Create new appointment

## Database Schema

The application uses the following main entities:

- **Patient**: Store patient information and communication preferences
- **Appointment**: Manage appointment scheduling
- **Template**: Pre-defined message templates
- **Communication**: Track all sent messages and calls

## Security & Privacy

- Patient data is stored securely in Azure PostgreSQL database
- Phone numbers are validated and formatted consistently
- Communication preferences are respected (SMS/Voice enabled flags)
- All API routes include proper error handling and validation

## Development

### Adding New Features

1. Create API routes in `src/app/api/`
2. Update Prisma schema if needed: `prisma/schema.prisma`
3. Add UI components in `src/components/`
4. Update the main dashboard in `src/app/page.tsx`

### Database Changes

1. Update `prisma/schema.prisma`
2. Run `npx prisma db push` to apply changes
3. Update seed script if needed: `src/lib/seed.ts`

## Troubleshooting

### Common Issues

1. **Twilio Authentication Error**: Verify your Account SID and Auth Token are correct
2. **Phone Number Format**: Ensure phone numbers are in E.164 format (+1234567890)
3. **Database Connection**: Make sure the Azure PostgreSQL database connection is properly configured
4. **Port Already in Use**: Change the port in package.json or kill the process using port 3000

### Error Codes

- `400`: Bad Request - Invalid input data
- `404`: Not Found - Resource doesn't exist
- `409`: Conflict - Duplicate data (e.g., phone number already exists)
- `500`: Internal Server Error - Check server logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for demonstration purposes. Please ensure compliance with healthcare regulations (HIPAA, etc.) when using in production environments.
