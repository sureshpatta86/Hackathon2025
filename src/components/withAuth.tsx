'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface WithAuthProps {
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthProps = {}
) {
  const {
    requireAuth = true,
    redirectTo = '/login',
    allowedRoles = []
  } = options;

  return function AuthenticatedComponent(props: P) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // Handle client-side mounting
    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!mounted || isLoading) return;

      // If authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        const currentPath = window.location.pathname;
        const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
        router.push(redirectUrl);
        return;
      }

      // If authentication is not required and user is authenticated, 
      // redirect to dashboard (useful for login page)
      if (!requireAuth && isAuthenticated) {
        // Check for redirect parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get('redirect') || '/dashboard';
        router.push(redirectPath);
        return;
      }

      // Check role-based authorization
      if (requireAuth && isAuthenticated && allowedRoles.length > 0) {
        const hasAllowedRole = allowedRoles.includes(user?.role || '');
        if (!hasAllowedRole) {
          router.push('/unauthorized');
          return;
        }
      }

      setIsAuthorized(true);
    }, [isAuthenticated, isLoading, user, router, mounted]);

    // Show loading state during SSR or initial load
    if (!mounted || isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Show unauthorized message for role-based restrictions
    if (requireAuth && isAuthenticated && allowedRoles.length > 0 && !allowedRoles.includes(user?.role || '')) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h1>
            <p className="text-gray-600 mb-4">You don&apos;t have permission to access this page.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    // Only render the component if authorized
    if (!isAuthorized) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Convenience HOCs for common use cases
export const withProtectedRoute = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, { requireAuth: true });

export const withPublicRoute = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, { requireAuth: false });

export const withAdminRoute = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, { requireAuth: true, allowedRoles: ['admin'] });

export const withManagerRoute = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, { requireAuth: true, allowedRoles: ['admin', 'manager'] });
