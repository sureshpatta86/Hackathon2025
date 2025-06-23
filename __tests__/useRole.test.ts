import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';

// Mock the AuthContext
jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

import { useRole } from '../src/hooks/useRole';
import { useAuth } from '../src/contexts/AuthContext';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('useRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return isAdmin true for admin user', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', username: 'admin', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn()
    });

    const { result } = renderHook(() => useRole());
    
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isUser).toBe(false);
    expect(result.current.canAccessAdmin()).toBe(true);
  });

  it('should return isUser true for user role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '2', username: 'user', role: 'user' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn()
    });

    const { result } = renderHook(() => useRole());
    
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isUser).toBe(true);
    expect(result.current.canAccessAdmin()).toBe(false);
  });

  it('should handle null user', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn()
    });

    const { result } = renderHook(() => useRole());
    
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isUser).toBe(false);
    expect(result.current.canAccessAdmin()).toBe(false);
  });

  it('hasRole should work with single role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', username: 'admin', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn()
    });

    const { result } = renderHook(() => useRole());
    
    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('user')).toBe(false);
  });

  it('hasRole should work with array of roles', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', username: 'admin', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn()
    });

    const { result } = renderHook(() => useRole());
    
    expect(result.current.hasRole(['admin', 'moderator'])).toBe(true);
    expect(result.current.hasRole(['user', 'guest'])).toBe(false);
  });

  it('should handle undefined user properties', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '3', username: 'testuser', role: '' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn()
    });

    const { result } = renderHook(() => useRole());
    
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isUser).toBe(false);
    expect(result.current.hasRole('admin')).toBe(false);
    expect(result.current.hasRole(['admin', 'user'])).toBe(false);
    expect(result.current.canAccessAdmin()).toBe(false);
  });

  it('should handle empty role string', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '4', username: 'testuser', role: '' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn()
    });

    const { result } = renderHook(() => useRole());
    
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isUser).toBe(false);
    expect(result.current.hasRole('')).toBe(true);
    expect(result.current.hasRole('admin')).toBe(false);
  });

  it('should handle custom role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '5', username: 'moderator', role: 'moderator' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn()
    });

    const { result } = renderHook(() => useRole());
    
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isUser).toBe(false);
    expect(result.current.hasRole('moderator')).toBe(true);
    expect(result.current.hasRole(['admin', 'moderator'])).toBe(true);
    expect(result.current.hasRole(['admin', 'user'])).toBe(false);
    expect(result.current.canAccessAdmin()).toBe(false);
  });

  it('should return user object from hook', () => {
    const testUser = { id: '1', username: 'admin', role: 'admin' };
    mockUseAuth.mockReturnValue({
      user: testUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn()
    });

    const { result } = renderHook(() => useRole());
    
    expect(result.current.user).toEqual(testUser);
  });

});
