import React from 'react';
import { render, screen } from '@testing-library/react';
import OverviewTab from '../src/components/dashboard/OverviewTab';
import type { Patient, Template, Communication } from '../src/types';

// Mock the UI components
jest.mock('../src/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 className={className} data-testid="card-title">{children}</h3>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  MessageSquare: ({ className }: { className?: string }) => (
    <div className={className} data-testid="message-square-icon" />
  ),
  Phone: ({ className }: { className?: string }) => (
    <div className={className} data-testid="phone-icon" />
  ),
  Users: ({ className }: { className?: string }) => (
    <div className={className} data-testid="users-icon" />
  ),
  BarChart3: ({ className }: { className?: string }) => (
    <div className={className} data-testid="bar-chart-icon" />
  ),
  Clock: ({ className }: { className?: string }) => (
    <div className={className} data-testid="clock-icon" />
  ),
}));

describe('OverviewTab', () => {
  const mockPatients: Patient[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      email: 'john@example.com',
      dateOfBirth: new Date('1990-01-01'),
      smsEnabled: true,
      voiceEnabled: true,
      medicalNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+1234567891',
      email: 'jane@example.com',
      dateOfBirth: new Date('1985-05-15'),
      smsEnabled: true,
      voiceEnabled: false,
      medicalNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockTemplates: Template[] = [
    {
      id: '1',
      name: 'Appointment Reminder',
      content: 'Your appointment is tomorrow at {appointmentTime}',
      type: 'SMS',
      category: 'reminder',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Follow-up Call',
      content: 'Please call us to schedule your follow-up',
      type: 'VOICE',
      category: 'follow-up',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockCommunications: Communication[] = [
    {
      id: '1',
      patientId: '1',
      patient: mockPatients[0],
      templateId: '1',
      type: 'SMS',
      content: 'Your appointment is tomorrow at 2:00 PM',
      phoneNumber: '+1234567890',
      status: 'DELIVERED',
      sentAt: '2025-06-23T10:00:00Z',
      scheduledFor: undefined,
      retryCount: 0,
      errorMessage: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      patientId: '2',
      patient: mockPatients[1],
      templateId: '2',
      type: 'VOICE',
      content: 'Please call us to schedule your follow-up appointment',
      phoneNumber: '+1234567891',
      status: 'FAILED',
      sentAt: '2025-06-22T14:30:00Z',
      scheduledFor: undefined,
      retryCount: 1,
      errorMessage: 'Number not reachable',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      patientId: '1',
      patient: mockPatients[0],
      templateId: '1',
      type: 'SMS',
      content: 'Test message content that is quite long and should be truncated',
      phoneNumber: '+1234567890',
      status: 'PENDING',
      sentAt: undefined,
      scheduledFor: '2025-06-25T09:00:00Z',
      retryCount: 0,
      errorMessage: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('should render welcome message', () => {
    render(
      <OverviewTab 
        patients={mockPatients} 
        templates={mockTemplates} 
        communications={mockCommunications} 
      />
    );

    expect(screen.getByText('Welcome to HealthComm Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Manage your patient communications efficiently and effectively.')).toBeInTheDocument();
  });

  it('should display correct statistics', () => {
    render(
      <OverviewTab 
        patients={mockPatients} 
        templates={mockTemplates} 
        communications={mockCommunications} 
      />
    );

    // Use more specific queries to avoid multiple element issues
    expect(screen.getByText('Total Patients')).toBeInTheDocument();
    expect(screen.getByText('Messages Sent')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    
    // Check specific values that should be unique
    expect(screen.getByText('3')).toBeInTheDocument(); // Messages Sent
    expect(screen.getByText('33%')).toBeInTheDocument(); // Success Rate (1 out of 3 delivered)
    
    // Use getAllByText for values that appear multiple times
    const twoValues = screen.getAllByText('2');
    expect(twoValues).toHaveLength(2); // Total Patients and Templates
  });

  it('should calculate success rate correctly', () => {
    const deliveredComms: Communication[] = [
      { ...mockCommunications[0], status: 'DELIVERED' },
      { ...mockCommunications[1], status: 'DELIVERED' },
      { ...mockCommunications[2], status: 'FAILED' },
    ];

    render(
      <OverviewTab 
        patients={mockPatients} 
        templates={mockTemplates} 
        communications={deliveredComms} 
      />
    );

    expect(screen.getByText('67%')).toBeInTheDocument(); // 2 out of 3 delivered
  });

  it('should show 0% success rate when no communications', () => {
    render(
      <OverviewTab 
        patients={mockPatients} 
        templates={mockTemplates} 
        communications={[]} 
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should display recent communications', () => {
    render(
      <OverviewTab 
        patients={mockPatients} 
        templates={mockTemplates} 
        communications={mockCommunications} 
      />
    );

    expect(screen.getByText('Recent Communications')).toBeInTheDocument();
    // Use getAllByText for names that appear multiple times
    const johnDoeElements = screen.getAllByText('John Doe');
    expect(johnDoeElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should truncate long message content', () => {
    render(
      <OverviewTab 
        patients={mockPatients} 
        templates={mockTemplates} 
        communications={mockCommunications} 
      />
    );

    expect(screen.getByText('Test message content that is quite long and should...')).toBeInTheDocument();
  });

  it('should display correct status badges', () => {
    render(
      <OverviewTab 
        patients={mockPatients} 
        templates={mockTemplates} 
        communications={mockCommunications} 
      />
    );

    expect(screen.getByText('DELIVERED')).toBeInTheDocument();
    expect(screen.getByText('FAILED')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('should display correct icons for communication types', () => {
    render(
      <OverviewTab 
        patients={mockPatients} 
        templates={mockTemplates} 
        communications={mockCommunications} 
      />
    );

    expect(screen.getAllByTestId('message-square-icon')).toHaveLength(4); // 2 SMS + 2 for header and empty state
    expect(screen.getByTestId('phone-icon')).toBeInTheDocument(); // 1 VOICE
  });

  it('should format dates correctly', () => {
    render(
      <OverviewTab 
        patients={mockPatients} 
        templates={mockTemplates} 
        communications={mockCommunications} 
      />
    );

    // Check if dates are formatted (exact format depends on locale)
    expect(screen.getByText('6/23/2025')).toBeInTheDocument();
    expect(screen.getByText('6/22/2025')).toBeInTheDocument();
  });

  it('should show empty state when no communications', () => {
    render(
      <OverviewTab 
        patients={mockPatients} 
        templates={mockTemplates} 
        communications={[]} 
      />
    );

    expect(screen.getByText('No communications yet.')).toBeInTheDocument();
    expect(screen.getByText('Start sending messages to see activity here.')).toBeInTheDocument();
  });

  it('should limit recent communications to 5 items', () => {
    const manyCommunications = Array.from({ length: 10 }, (_, i) => ({
      ...mockCommunications[0],
      id: `comm-${i}`,
      patient: { ...mockPatients[0], firstName: `Patient${i}` },
    }));

    render(
      <OverviewTab 
        patients={mockPatients} 
        templates={mockTemplates} 
        communications={manyCommunications} 
      />
    );

    // Should only show first 5 - patient names are rendered as "Patient0 Doe"
    expect(screen.getByText('Patient0 Doe')).toBeInTheDocument();
    expect(screen.getByText('Patient4 Doe')).toBeInTheDocument();
    expect(screen.queryByText('Patient5 Doe')).not.toBeInTheDocument();
  });

  it('should handle empty arrays gracefully', () => {
    render(
      <OverviewTab 
        patients={[]} 
        templates={[]} 
        communications={[]} 
      />
    );

    // Check that zeros are displayed - use getAllByText since 0 appears multiple times
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBeGreaterThan(0);
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('No communications yet.')).toBeInTheDocument();
  });

  it('should not crash with communications without sentAt', () => {
    const commsWithoutSentAt: Communication[] = [
      {
        ...mockCommunications[0],
        sentAt: undefined,
      },
    ];

    render(
      <OverviewTab 
        patients={mockPatients} 
        templates={mockTemplates} 
        communications={commsWithoutSentAt} 
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
