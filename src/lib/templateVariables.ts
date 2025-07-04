import { Patient, Appointment } from '@prisma/client';

export interface TemplateVariables {
  // Patient variables
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  
  // Appointment variables
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentDateTime?: string;
  appointmentTitle?: string;
  appointmentDescription?: string;
  
  // Clinic/Provider variables
  clinicName?: string;
  providerName?: string;
  clinicPhone?: string;
  
  // Custom variables
  [key: string]: string | undefined;
}

export function replaceTemplateVariables(
  template: string, 
  patient?: Patient, 
  appointment?: Appointment & { appointmentDate: Date },
  customVariables?: Record<string, string>
): string {
  let result = template;
  
  // Patient variables
  if (patient) {
    const variables: TemplateVariables = {
      firstName: patient.firstName,
      lastName: patient.lastName,
      fullName: `${patient.firstName} ${patient.lastName}`,
      phoneNumber: patient.phoneNumber,
      email: patient.email || '',
    };
    
    // Replace patient variables
    for (const [key, value] of Object.entries(variables)) {
      if (value !== undefined) {
        const regex = new RegExp(`\\{${key}\\}`, 'gi');
        result = result.replace(regex, value);
      }
    }
  }
  
  // Appointment variables
  if (appointment) {
    const appointmentVars: TemplateVariables = {
      appointmentTitle: appointment.title,
      appointmentDescription: appointment.description || '',
      appointmentDate: formatDate(appointment.appointmentDate),
      appointmentTime: formatTime(appointment.appointmentDate),
      appointmentDateTime: formatDateTime(appointment.appointmentDate),
    };
    
    // Replace appointment variables
    for (const [key, value] of Object.entries(appointmentVars)) {
      if (value !== undefined) {
        const regex = new RegExp(`\\{${key}\\}`, 'gi');
        result = result.replace(regex, value);
      }
    }
  }
  
  // Default clinic variables (you can make these configurable)
  const defaultVariables: TemplateVariables = {
    clinicName: process.env.NEXT_PUBLIC_APP_NAME || 'HealthComm Clinic',
    providerName: 'Dr. Smith',
    clinicPhone: process.env.TWILIO_PHONE_NUMBER || '+17629996610',
  };
  
  // Replace default variables
  for (const [key, value] of Object.entries(defaultVariables)) {
    if (value !== undefined) {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      result = result.replace(regex, value);
    }
  }
  
  // Custom variables
  if (customVariables) {
    for (const [key, value] of Object.entries(customVariables)) {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      result = result.replace(regex, value);
    }
  }
  
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function formatDateTime(date: Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

// Helper function to get available template variables
// Updated with expanded variable set - v2.0
export function getAvailableTemplateVariables(): Record<string, string> {
  return {
    // Patient variables
    '{firstName}': 'Patient\'s first name',
    '{lastName}': 'Patient\'s last name', 
    '{fullName}': 'Patient\'s full name',
    '{phoneNumber}': 'Patient\'s phone number',
    '{email}': 'Patient\'s email address',
    '{patientId}': 'Patient\'s unique ID number',
    '{age}': 'Patient\'s age',
    '{dateOfBirth}': 'Patient\'s date of birth',
    '{gender}': 'Patient\'s gender',
    '{address}': 'Patient\'s address',
    '{emergencyContact}': 'Emergency contact person',
    '{emergencyPhone}': 'Emergency contact phone number',
    
    // Appointment variables
    '{appointmentDate}': 'Appointment date (e.g., Monday, June 20, 2025)',
    '{appointmentTime}': 'Appointment time (e.g., 2:30 PM)',
    '{appointmentDateTime}': 'Full appointment date and time',
    '{appointmentTitle}': 'Appointment title/type',
    '{appointmentDescription}': 'Appointment description',
    '{appointmentDuration}': 'Appointment duration (e.g., 30 minutes)',
    '{appointmentLocation}': 'Appointment location/room',
    '{appointmentStatus}': 'Appointment status (scheduled, confirmed, etc.)',
    '{appointmentId}': 'Unique appointment ID',
    '{nextAppointment}': 'Next scheduled appointment date',
    '{lastAppointment}': 'Last appointment date',
    
    // Clinic variables
    '{clinicName}': 'Clinic or practice name',
    '{providerName}': 'Healthcare provider name',
    '{clinicPhone}': 'Clinic phone number',
    '{clinicEmail}': 'Clinic email address',
    '{clinicAddress}': 'Clinic physical address',
    '{clinicWebsite}': 'Clinic website URL',
    '{officeHours}': 'Clinic office hours',
    '{departmentName}': 'Specific department name',
    '{receptionistName}': 'Front desk receptionist name',
    
    // Additional utility variables
    '{currentDate}': 'Today\'s date',
    '{currentTime}': 'Current time',
    '{dayOfWeek}': 'Current day of the week',
    '{month}': 'Current month name',
    '{year}': 'Current year',
    '{greeting}': 'Time-appropriate greeting (Good morning/afternoon/evening)',
    '{urgency}': 'Message urgency level (Normal, Urgent, Emergency)',
    '{confirmationCode}': 'Appointment confirmation code',
    '{rescheduleLink}': 'Link to reschedule appointment',
    '{cancelLink}': 'Link to cancel appointment',
  };
}
