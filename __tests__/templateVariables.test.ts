import { replaceTemplateVariables, getAvailableTemplateVariables } from '../src/lib/templateVariables';
import { Patient, Appointment, AppointmentStatus } from '@prisma/client';

describe('templateVariables', () => {
  const mockPatient: Patient = {
    id: '1',
    firstName: 'Jane',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    email: 'jane.doe@example.com',
    dateOfBirth: new Date('1990-01-01'),
    smsEnabled: true,
    voiceEnabled: true,
    medicalNotes: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockAppointment: Appointment & { appointmentDate: Date } = {
    id: '1',
    patientId: '1',
    title: 'Annual Checkup',
    description: 'Regular health checkup',
    appointmentDate: new Date('2025-06-23T14:30:00'),
    duration: 30,
    status: 'SCHEDULED',
    reminderSent: false,
    reminderDate: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  describe('replaceTemplateVariables', () => {
    it('should replace patient variables', () => {
      const template = 'Hello {firstName} {lastName}!';
      const result = replaceTemplateVariables(template, mockPatient);
      
      expect(result).toBe('Hello Jane Doe!');
    });

    it('should replace patient variables with curly braces', () => {
      const template = 'Hello {firstName} {lastName}, your phone is {phoneNumber}';
      const result = replaceTemplateVariables(template, mockPatient);
      
      expect(result).toBe('Hello Jane Doe, your phone is +1234567890');
    });

    it('should replace fullName variable', () => {
      const template = 'Dear {fullName}';
      const result = replaceTemplateVariables(template, mockPatient);
      
      expect(result).toBe('Dear Jane Doe');
    });

    it('should handle email variable', () => {
      const template = 'Contact: {email}';
      const result = replaceTemplateVariables(template, mockPatient);
      
      expect(result).toBe('Contact: jane.doe@example.com');
    });

    it('should replace appointment variables', () => {
      const template = 'Your {appointmentTitle} is scheduled for {appointmentDate}';
      const result = replaceTemplateVariables(template, undefined, mockAppointment);
      
      expect(result).toContain('Your Annual Checkup is scheduled for');
      expect(result).toContain('Monday, June 23, 2025');
    });

    it('should replace appointment time and description', () => {
      const template = 'Appointment: {appointmentDescription} at {appointmentTime}';
      const result = replaceTemplateVariables(template, undefined, mockAppointment);
      
      expect(result).toContain('Regular health checkup');
      expect(result).toContain('2:30 PM');
    });

    it('should replace appointment datetime', () => {
      const template = 'Scheduled for {appointmentDateTime}';
      const result = replaceTemplateVariables(template, undefined, mockAppointment);
      
      expect(result).toContain('Monday, June 23, 2025 at 2:30 PM');
    });

    it('should replace default clinic variables', () => {
      const template = 'Visit {clinicName}, call {clinicPhone}';
      const result = replaceTemplateVariables(template);
      
      expect(result).toContain('HealthComm Clinic');
      expect(result).toContain('+17629996610');
    });

    it('should replace provider name', () => {
      const template = 'Your doctor is {providerName}';
      const result = replaceTemplateVariables(template);
      
      expect(result).toBe('Your doctor is Dr. Smith');
    });

    it('should replace custom variables', () => {
      const template = 'Hello {customName}, your code is {confirmationCode}';
      const customVars = { customName: 'John', confirmationCode: '12345' };
      const result = replaceTemplateVariables(template, undefined, undefined, customVars);
      
      expect(result).toBe('Hello John, your code is 12345');
    });

    it('should replace both patient and appointment variables', () => {
      const template = 'Hi {firstName}, your {appointmentTitle} is at {appointmentTime}';
      const result = replaceTemplateVariables(template, mockPatient, mockAppointment);
      
      expect(result).toContain('Hi Jane');
      expect(result).toContain('Annual Checkup');
      expect(result).toContain('2:30 PM');
    });

    it('should handle case insensitive replacement', () => {
      const template = 'Hello {FirstName} and {LASTNAME}';
      const result = replaceTemplateVariables(template, mockPatient);
      
      expect(result).toBe('Hello Jane and Doe');
    });

    it('should handle templates with no variables', () => {
      const template = 'This is a static message';
      const result = replaceTemplateVariables(template, mockPatient);
      
      expect(result).toBe('This is a static message');
    });

    it('should handle empty template', () => {
      const template = '';
      const result = replaceTemplateVariables(template, mockPatient);
      
      expect(result).toBe('');
    });

    it('should handle patient with missing email', () => {
      const patientNoEmail = { ...mockPatient, email: null };
      const template = 'Contact: {email}';
      const result = replaceTemplateVariables(template, patientNoEmail);
      
      expect(result).toBe('Contact: ');
    });

    it('should handle appointment with missing description', () => {
      const appointmentNoDesc = { ...mockAppointment, description: null };
      const template = 'Details: {appointmentDescription}';
      const result = replaceTemplateVariables(template, undefined, appointmentNoDesc);
      
      expect(result).toBe('Details: ');
    });

    it('should handle undefined patient and appointment', () => {
      const template = 'Hello {firstName}, clinic: {clinicName}';
      const result = replaceTemplateVariables(template);
      
      expect(result).toBe('Hello {firstName}, clinic: HealthComm Clinic');
    });

    it('should combine all variable types', () => {
      const template = 'Hi {firstName}, your {appointmentTitle} at {clinicName} is {appointmentDateTime}. Custom: {myVar}';
      const customVars = { myVar: 'test123' };
      const result = replaceTemplateVariables(template, mockPatient, mockAppointment, customVars);
      
      expect(result).toContain('Hi Jane');
      expect(result).toContain('Annual Checkup');
      expect(result).toContain('HealthComm Clinic');
      expect(result).toContain('Monday, June 23, 2025 at 2:30 PM');
      expect(result).toContain('Custom: test123');
    });
  });

  describe('getAvailableTemplateVariables', () => {
    it('should return available template variables object', () => {
      const variables = getAvailableTemplateVariables();
      
      expect(typeof variables).toBe('object');
      expect(variables).toBeDefined();
    });

    it('should include patient variables', () => {
      const variables = getAvailableTemplateVariables();
      
      expect(variables['{firstName}']).toBeDefined();
      expect(variables['{lastName}']).toBeDefined();
      expect(variables['{fullName}']).toBeDefined();
      expect(variables['{phoneNumber}']).toBeDefined();
      expect(variables['{email}']).toBeDefined();
    });

    it('should include appointment variables', () => {
      const variables = getAvailableTemplateVariables();
      
      expect(variables['{appointmentDate}']).toBeDefined();
      expect(variables['{appointmentTime}']).toBeDefined();
      expect(variables['{appointmentDateTime}']).toBeDefined();
      expect(variables['{appointmentTitle}']).toBeDefined();
      expect(variables['{appointmentDescription}']).toBeDefined();
    });

    it('should include clinic variables', () => {
      const variables = getAvailableTemplateVariables();
      
      expect(variables['{clinicName}']).toBeDefined();
      expect(variables['{providerName}']).toBeDefined();
      expect(variables['{clinicPhone}']).toBeDefined();
    });

    it('should include utility variables', () => {
      const variables = getAvailableTemplateVariables();
      
      expect(variables['{currentDate}']).toBeDefined();
      expect(variables['{currentTime}']).toBeDefined();
      expect(variables['{confirmationCode}']).toBeDefined();
    });

    it('should return string descriptions for all variables', () => {
      const variables = getAvailableTemplateVariables();
      
      Object.values(variables).forEach(description => {
        expect(typeof description).toBe('string');
        expect(description.length).toBeGreaterThan(0);
      });
    });
  });
});
