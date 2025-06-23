'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import Logo from '@/components/ui/logo';
import { Lock, User } from 'lucide-react';
import { loginSchema } from '@/lib/validation';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

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
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const { login, isAuthenticated } = useAuth();

  
  // Note: redirectTo is handled by withPublicRoute HOC
  
  // Show loading if we're in the process of submitting or about to redirect
  const showLoading = isLoading || shouldRedirect;

  // Only show redirect loading if we explicitly set it after successful login
  if (shouldRedirect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Navigation />
        <div className="flex items-center justify-center p-4 pt-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

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
    // DON'T auto-clear general error on input change - let user see the error
    // if (error) {
    //   console.log('Clearing error due to input change:', field, value);
    //   setError('');
    // }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(''); // Clear any previous error

    try {
      const result = await login(credentials);
      
      if (result.success) {
        setIsLoading(false);
        // Clear form on successful login
        setCredentials({ username: '', password: '' });
        setShouldRedirect(true);
      } else {
        const errorMessage = result.error || 'Invalid username or password';
        setIsLoading(false);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      setError('Something went wrong. Please try again.');
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
                    disabled={showLoading}
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
                    disabled={showLoading}
                    className={`w-full ${validationErrors.password ? 'border-red-500' : ''}`}
                    autoComplete="current-password"
                  />
                  {validationErrors.password && (
                    <p className="text-sm text-red-600">{validationErrors.password}</p>
                  )}
                </div>

                {/* Error Message */}
                {error && error.trim() !== '' && (
                  <div className="p-4 bg-red-100 border-2 border-red-400 rounded-lg mb-4 shadow-lg" data-testid="error-message">
                    <div className="flex items-center">
                      <div className="text-red-600 mr-3 text-lg">🚨</div>
                      <div>
                        <p className="text-red-800 font-bold text-sm">Login Failed</p>
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={showLoading || !credentials.username || !credentials.password}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  variant="primary"
                >
                  {showLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      {isAuthenticated ? 'Redirecting...' : 'Signing In...'}
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

// Wrapper component to handle Suspense for useSearchParams and auth redirection
function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Handle redirection for already authenticated users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Only redirect if user is actually authenticated and not in the middle of a login attempt
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect') || '/dashboard';
      router.replace(redirectPath);
    }
  }, [isAuthenticated, isLoading, router]);

  // Don't render the login form if user is authenticated
  if (!isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Navigation />
        <div className="flex items-center justify-center p-4 pt-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

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

// Export the login page with built-in authentication redirect
export default LoginPage;
