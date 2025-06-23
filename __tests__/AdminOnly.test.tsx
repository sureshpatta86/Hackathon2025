import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminOnly } from '../src/components/AdminOnly';

// Mock the AuthContext
jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

import { useAuth } from '../src/contexts/AuthContext';
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AdminOnly', () => {
  const ChildComponent = () => <div data-testid="child">Child content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children for admin user', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', username: 'admin', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn()
    });

    render(
      <AdminOnly>
        <ChildComponent />
      </AdminOnly>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should not render children for non-admin user', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '2', username: 'user', role: 'user' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn()
    });

    render(
      <AdminOnly>
        <ChildComponent />
      </AdminOnly>
    );

    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('should not render children for unauthenticated user', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn()
    });

    render(
      <AdminOnly>
        <ChildComponent />
      </AdminOnly>
    );

    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });
});
