import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../src/contexts/AuthContext';
import { withAuth, withProtectedRoute, withPublicRoute, withAdminRoute, withManagerRoute } from '../src/components/withAuth';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the auth context
jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();

// Test component
const TestComponent = () => <div data-testid="test-component">Protected Content</div>;

describe('withAuth HOC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });

    // Reset window.location state to default
    window.location.pathname = '/dashboard';
    window.location.search = '';
    window.location.href = 'http://localhost:3000/dashboard';
  });

  describe('requireAuth: true (default)', () => {
    it('should render component when user is authenticated', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', username: 'test', role: 'user' },
        isAuthenticated: true,
        isLoading: false,
      });

      const ProtectedComponent = withAuth(TestComponent);
      render(<ProtectedComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });
    });

    it('should redirect to login when user is not authenticated', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      const ProtectedComponent = withAuth(TestComponent);
      render(<ProtectedComponent />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2Fdashboard');
      });
    });

    it('should show loading state when isLoading is true', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      });

      const ProtectedComponent = withAuth(TestComponent);
      render(<ProtectedComponent />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });

    it('should redirect to custom path when provided', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      const ProtectedComponent = withAuth(TestComponent, { redirectTo: '/custom-login' });
      render(<ProtectedComponent />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/custom-login?redirect=%2Fdashboard');
      });
    });
  });

  describe('requireAuth: false', () => {
    it('should render component when user is not authenticated', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      const PublicComponent = withAuth(TestComponent, { requireAuth: false });
      render(<PublicComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });
    });

    it('should redirect authenticated user to dashboard', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', username: 'test', role: 'user' },
        isAuthenticated: true,
        isLoading: false,
      });

      const PublicComponent = withAuth(TestComponent, { requireAuth: false });
      render(<PublicComponent />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should redirect authenticated user to redirect parameter', async () => {
      window.location.pathname = '/login';
      window.location.search = '?redirect=%2Fspecial-page';

      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', username: 'test', role: 'user' },
        isAuthenticated: true,
        isLoading: false,
      });

      const PublicComponent = withAuth(TestComponent, { requireAuth: false });
      render(<PublicComponent />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/special-page');
      });
    });
  });

  describe('role-based authorization', () => {
    it('should allow access when user has allowed role', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', username: 'test', role: 'admin' },
        isAuthenticated: true,
        isLoading: false,
      });

      const AdminComponent = withAuth(TestComponent, { 
        requireAuth: true, 
        allowedRoles: ['admin'] 
      });
      render(<AdminComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });
    });

    it('should redirect to unauthorized when user lacks required role', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', username: 'test', role: 'user' },
        isAuthenticated: true,
        isLoading: false,
      });

      const AdminComponent = withAuth(TestComponent, { 
        requireAuth: true, 
        allowedRoles: ['admin'] 
      });
      render(<AdminComponent />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/unauthorized');
      });
    });

    it('should show unauthorized page for insufficient role', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', username: 'test', role: 'user' },
        isAuthenticated: true,
        isLoading: false,
      });

      const AdminComponent = withAuth(TestComponent, { 
        requireAuth: true, 
        allowedRoles: ['admin'] 
      });
      
      const { rerender } = render(<AdminComponent />);
      
      // Re-render to simulate the state after role check
      rerender(<AdminComponent />);

      expect(screen.getByText('Unauthorized')).toBeInTheDocument();
      expect(screen.getByText('You don\'t have permission to access this page.')).toBeInTheDocument();
    });

    it('should allow multiple roles', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', username: 'test', role: 'manager' },
        isAuthenticated: true,
        isLoading: false,
      });

      const ManagerComponent = withAuth(TestComponent, { 
        requireAuth: true, 
        allowedRoles: ['admin', 'manager'] 
      });
      render(<ManagerComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });
    });
  });

  describe('convenience HOCs', () => {
    it('withProtectedRoute should require authentication', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      const ProtectedComponent = withProtectedRoute(TestComponent);
      render(<ProtectedComponent />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2Fdashboard');
      });
    });

    it('withPublicRoute should not require authentication', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      const PublicComponent = withPublicRoute(TestComponent);
      render(<PublicComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });
    });

    it('withAdminRoute should require admin role', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', username: 'test', role: 'user' },
        isAuthenticated: true,
        isLoading: false,
      });

      const AdminComponent = withAdminRoute(TestComponent);
      render(<AdminComponent />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/unauthorized');
      });
    });

    it('withManagerRoute should allow admin and manager roles', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', username: 'test', role: 'admin' },
        isAuthenticated: true,
        isLoading: false,
      });

      const ManagerComponent = withManagerRoute(TestComponent);
      render(<ManagerComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle user without role', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', username: 'test' }, // No role property
        isAuthenticated: true,
        isLoading: false,
      });

      const AdminComponent = withAuth(TestComponent, { 
        requireAuth: true, 
        allowedRoles: ['admin'] 
      });
      render(<AdminComponent />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/unauthorized');
      });
    });

    it('should handle empty allowedRoles array', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', username: 'test', role: 'user' },
        isAuthenticated: true,
        isLoading: false,
      });

      const Component = withAuth(TestComponent, { 
        requireAuth: true, 
        allowedRoles: [] 
      });
      render(<Component />);

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });
    });

    it('should not redirect during SSR (not mounted)', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      const ProtectedComponent = withAuth(TestComponent);
      render(<ProtectedComponent />);

      // Should show loading, not redirect
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
