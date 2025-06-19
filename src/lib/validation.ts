import { z } from 'zod';

// Common validation schemas
export const phoneNumberSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must be at most 15 digits')
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format');

export const emailSchema = z.string()
  .email('Invalid email format')
  .optional()
  .or(z.literal(''));

export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(50, 'Name must be at most 50 characters')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters');

// Auth validation schemas
export const loginSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be at most 100 characters'),
});

// Patient validation schemas
export const createPatientSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phoneNumber: phoneNumberSchema,
  email: emailSchema,
  dateOfBirth: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 150;
    }, 'Invalid date of birth'),
  smsEnabled: z.boolean().default(true),
  voiceEnabled: z.boolean().default(true),
  medicalNotes: z.string()
    .max(1000, 'Medical notes must be at most 1000 characters')
    .optional(),
});

export const updatePatientSchema = createPatientSchema.extend({
  id: z.string().uuid('Invalid patient ID'),
});

// Template validation schemas
export const createTemplateSchema = z.object({
  name: z.string()
    .min(1, 'Template name is required')
    .max(100, 'Template name must be at most 100 characters'),
  type: z.enum(['SMS', 'VOICE'], {
    errorMap: () => ({ message: 'Type must be either SMS or VOICE' }),
  }),
  content: z.string()
    .min(1, 'Template content is required')
    .max(1600, 'Template content must be at most 1600 characters'),
});

export const updateTemplateSchema = createTemplateSchema.extend({
  id: z.string().uuid('Invalid template ID'),
});

// Communication validation schemas
export const sendCommunicationSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  type: z.enum(['SMS', 'VOICE']),
  content: z.string()
    .min(1, 'Message content is required')
    .max(1600, 'Message content must be at most 1600 characters'),
  phoneNumber: phoneNumberSchema.optional(),
  templateId: z.string().uuid('Invalid template ID').optional(),
});

export const bulkCommunicationSchema = z.object({
  patientIds: z.array(z.string().uuid()).min(1, 'At least one patient is required'),
  type: z.enum(['SMS', 'VOICE']),
  content: z.string()
    .min(1, 'Message content is required')
    .max(1600, 'Message content must be at most 1600 characters'),
  templateId: z.string().uuid('Invalid template ID').optional(),
});

// Patient group validation schemas
export const createPatientGroupSchema = z.object({
  name: z.string()
    .min(1, 'Group name is required')
    .max(100, 'Group name must be at most 100 characters'),
  description: z.string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  patientIds: z.array(z.string().uuid()).optional(),
});

export const updatePatientGroupSchema = createPatientGroupSchema.extend({
  id: z.string().uuid('Invalid group ID'),
});

// Appointment validation schemas
export const createAppointmentSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  appointmentDate: z.string()
    .refine((date) => {
      const appointmentDate = new Date(date);
      const now = new Date();
      return appointmentDate > now;
    }, 'Appointment date must be in the future'),
  type: z.string()
    .min(1, 'Appointment type is required')
    .max(100, 'Appointment type must be at most 100 characters'),
  notes: z.string()
    .max(1000, 'Notes must be at most 1000 characters')
    .optional(),
  reminderEnabled: z.boolean().default(true),
  reminderMinutes: z.number()
    .min(15, 'Reminder must be at least 15 minutes before')
    .max(10080, 'Reminder cannot be more than 7 days before')
    .default(60),
});

export const updateAppointmentSchema = createAppointmentSchema.extend({
  id: z.string().uuid('Invalid appointment ID'),
});

// Settings validation schemas
export const updateSettingsSchema = z.object({
  messagingMode: z.enum(['demo', 'live']),
  twilioAccountSid: z.string()
    .min(1, 'Twilio Account SID is required for live mode')
    .optional(),
  twilioAuthToken: z.string()
    .min(1, 'Twilio Auth Token is required for live mode')
    .optional(),
  twilioPhoneNumber: phoneNumberSchema.optional(),
});

// Analytics validation schemas
export const analyticsQuerySchema = z.object({
  dateRange: z.string()
    .regex(/^\d+$/, 'Date range must be a number of days')
    .transform((val) => parseInt(val))
    .refine((days) => days > 0 && days <= 365, 'Date range must be between 1 and 365 days'),
});

// CSV import validation schema
export const csvImportSchema = z.object({
  mapping: z.object({
    firstName: z.string().min(1, 'First name column is required'),
    lastName: z.string().min(1, 'Last name column is required'),
    phoneNumber: z.string().min(1, 'Phone number column is required'),
    email: z.string().optional(),
  }),
  data: z.array(z.record(z.string(), z.any())).min(1, 'At least one row of data is required'),
});

// Helper function to handle Zod validation errors
export function formatValidationError(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    fieldErrors[path] = err.message;
  });
  
  return {
    message: 'Validation failed',
    errors: fieldErrors,
  };
}

// Helper function to validate request body
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: { message: string; errors?: Record<string, string> } }> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: formatValidationError(error) };
    }
    return { success: false, error: { message: 'Invalid JSON format' } };
  }
}
