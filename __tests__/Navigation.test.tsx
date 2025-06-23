import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '../src/components/Navigation';

// Mock the AuthContext
jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

import { useAuth } from '../src/contexts/AuthContext';
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render navigation component', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', username: 'admin', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn()
    });

    render(<Navigation />);
    
    // Test for the component to render without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('should handle unauthenticated state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn()
    });

    render(<Navigation />);
    
    // Test for the component to render without crashing
    expect(document.body).toBeInTheDocument();
  });
});
