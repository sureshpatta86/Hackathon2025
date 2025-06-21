'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthDebug() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-yellow-50 border-yellow-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-yellow-800">Auth Debug</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xs space-y-1">
          <div>
            <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}
          </div>
          <div>
            <strong>Cookies:</strong> {typeof window !== 'undefined' ? document.cookie : 'SSR'}
          </div>
          <div>
            <strong>SessionStorage:</strong> {
              typeof window !== 'undefined' 
                ? sessionStorage.getItem('user') || 'None' 
                : 'SSR'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
