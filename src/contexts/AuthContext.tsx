'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  role: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    try {
      // Only run on client side
      if (typeof window === 'undefined') {
        return false;
      }

      // First check sessionStorage for client-side persistence
      const storedUser = sessionStorage.getItem('user');
      const authToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      if (storedUser && authToken) {
        setUser(JSON.parse(storedUser));
        return true;
      }

      // If no stored session, try to validate with server
      const response = await fetch('/api/auth/validate', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        sessionStorage.setItem('user', JSON.stringify(userData.user));
        return true;
      }

      // Clear any invalid session data
      setUser(null);
      sessionStorage.removeItem('user');
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'user-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      return false;
    }
  };

  // Login function
  const login = async (credentials: { username: string; password: string }): Promise<boolean> => {
    try {
      // Only run on client side
      if (typeof window === 'undefined') {
        return false;
      }

      setIsLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Store in sessionStorage for client-side persistence
        sessionStorage.setItem('user', JSON.stringify(data.user));
        
        // Set cookies for server-side validation
        if (data.token) {
          document.cookie = `auth-token=${data.token}; path=/; ${process.env.NODE_ENV === 'production' ? 'secure;' : ''} samesite=lax`;
        }
        document.cookie = `user-session=${JSON.stringify(data.user)}; path=/; ${process.env.NODE_ENV === 'production' ? 'secure;' : ''} samesite=lax`;
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Call logout API to invalidate server session first
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }

    // Clear local state and storage
    setUser(null);
    sessionStorage.removeItem('user');
    
    // Clear cookies
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'user-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Navigate to login page
    router.push('/login');
  };

  // Check auth on mount
  useEffect(() => {
    const initAuth = async () => {
      // Only run on client side
      if (typeof window !== 'undefined') {
        // Don't auto-authenticate on login page - force user to login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          await checkAuth();
        }
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
