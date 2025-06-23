import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import BulkMessagingTab from '../src/components/dashboard/BulkMessagingTab';

// Mock the AuthContext
jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { id: '1', username: 'admin', role: 'admin' },
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    checkAuth: jest.fn()
  })
}));

// Mock the NotificationProvider and useNotification hook
jest.mock('../src/components/ui/notification', () => ({
  useNotification: () => ({
    addNotification: jest.fn()
  }),
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('BulkMessagingTab', () => {
  const mockProps = {
    patients: [],
    templates: [],
    settings: { messagingMode: 'demo', twilioConfigured: false }
  };

  it('should render bulk messaging tab', () => {
    render(<BulkMessagingTab {...mockProps} />);
    
    // Test for the component to render without crashing
    expect(document.body).toBeInTheDocument();
  });
});
