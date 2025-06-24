// Common types for the application

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  smsEnabled: boolean;
  voiceEnabled: boolean;
  _count?: {
    appointments: number;
    communications: number;
  };
  [key: string]: unknown;
}

export interface Template {
  id: string;
  name: string;
  type: 'SMS' | 'VOICE';
  content: string;
  [key: string]: unknown;
}

export interface Communication {
  id: string;
  type: 'SMS' | 'VOICE';
  content: string;
  phoneNumber: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  errorMessage?: string;
  patient: Patient;
  template?: {
    id: string;
    name: string;
  };
  [key: string]: unknown;
}

export interface Analytics {
  stats: {
    totalCommunications: number;
    sms: {
      total: number;
      delivered: number;
      failed: number;
      pending: number;
    };
    voice: {
      total: number;
      delivered: number;
      failed: number;
      pending: number;
    };
  };
  successRates: {
    sms: number;
    voice: number;
  };
  dailyStats: Array<{
    date: string;
    sent: number;
    delivered: number;
    failed: number;
    sms?: number;
    voice?: number;
    total?: number;
  }>;
  topPatients: Array<{
    name: string;
    count: number;
  }>;
  recentFailures?: Array<{
    id: string;
    type: 'SMS' | 'VOICE' | string;
    patient: string;
    phoneNumber: string;
    errorMessage: string;
    failedAt: string;
  }>;
  dateRange?: {
    from: string;
    to: string;
    days: number;
  };
}

export interface AppSettings {
  messagingMode: string;
  twilioConfigured: boolean;
  twilioPhoneNumber: string | null;
}

// Form data types
export interface PatientFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  smsEnabled: boolean;
  voiceEnabled: boolean;
}

export interface TemplateFormData {
  name: string;
  type: 'SMS' | 'VOICE';
  content: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface PatientGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  _count: {
    patients: number;
  };
  patients: Array<{
    patient: Patient;
  }>;
}
