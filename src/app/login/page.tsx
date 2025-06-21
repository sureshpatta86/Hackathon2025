'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import Logo from '@/components/ui/logo';
import { Lock, User } from 'lucide-react';
import { loginSchema } from '@/lib/validation';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { withPublicRoute } from '@/components/withAuth';

interface ValidationErrors {
  username?: string;
  password?: string;
}

function LoginForm() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  // Get redirect URL from query params
  const redirectTo = searchParams?.get('redirect') || '/dashboard';

  const validateForm = () => {
    try {
      loginSchema.parse(credentials);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof ValidationErrors;
          errors[field] = err.message;
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleInputChange = (field: 'username' | 'password', value: string) => {
    setCredentials({ ...credentials, [field]: value });
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: undefined });
    }
    // Clear general error
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await login(credentials);
      
      if (success) {
        // Redirect to the intended page or dashboard
        router.push(redirectTo);
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <Navigation />
      
      <div className="flex items-center justify-center p-4 pt-20">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-100 rounded-full opacity-20"></div>
        </div>

        <div className="relative w-full max-w-md">
          {/* Login Card */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center mb-4">
                <Logo size="lg" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Welcome Back
              </CardTitle>
              <p className="text-gray-600">
                Sign in to access your healthcare communication dashboard
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Username
                  </label>
                  <Input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter your username"
                    required
                    className={`w-full ${validationErrors.username ? 'border-red-500' : ''}`}
                    autoComplete="username"
                  />
                  {validationErrors.username && (
                    <p className="text-sm text-red-600">{validationErrors.username}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Password
                  </label>
                  <Input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    required
                    className={`w-full ${validationErrors.password ? 'border-red-500' : ''}`}
                    autoComplete="current-password"
                  />
                  {validationErrors.password && (
                    <p className="text-sm text-red-600">{validationErrors.password}</p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !credentials.username || !credentials.password}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  variant="primary"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Security Notice */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <Lock className="h-3 w-3 mr-1" />
                  Your data is protected with enterprise-grade security
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact your system administrator or use the navigation above to return home.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component to handle Suspense for useSearchParams
function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Navigation />
        <div className="flex items-center justify-center p-4 pt-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

// Export with public route protection (redirects to dashboard if already authenticated)
export default withPublicRoute(LoginPage);
