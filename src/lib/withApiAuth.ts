import { NextRequest, NextResponse } from 'next/server';

interface AuthenticatedUser {
  id: string;
  username: string;
  role: string;
  email?: string;
}

interface WithAuthOptions {
  allowedRoles?: string[];
}

// Helper function to validate token (same as in validate route)
function validateToken(token: string): { valid: boolean; userId?: string; role?: string } {
  try {
    if (!token || token.length < 10) {
      return { valid: false };
    }
    
    const parts = token.split(':');
    if (parts.length >= 2) {
      return {
        valid: true,
        userId: parts[0],
        role: parts[1] || 'user'
      };
    }
    
    return { valid: false };
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false };
  }
}

// Helper function to get user from request
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Get token from cookies or Authorization header
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }
    
    const validation = validateToken(token);
    
    if (!validation.valid) {
      return null;
    }
    
    // In a real app, fetch user details from database
    return {
      id: validation.userId!,
      username: `user_${validation.userId}`,
      role: validation.role!,
      email: `user_${validation.userId}@example.com`
    };
    
  } catch (error) {
    console.error('Auth user retrieval error:', error);
    return null;
  }
}

// Higher-order function for protecting API routes
export function withAuth(
  handler: (request: NextRequest, user: AuthenticatedUser, ...args: unknown[]) => Promise<NextResponse>,
  options: WithAuthOptions = {}
) {
  return async function protectedHandler(
    request: NextRequest,
    ...args: unknown[]
  ): Promise<NextResponse> {
    try {
      const user = await getAuthenticatedUser(request);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // Check role-based authorization
      if (options.allowedRoles && options.allowedRoles.length > 0) {
        if (!options.allowedRoles.includes(user.role)) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }
      
      // Call the original handler with authenticated user
      return await handler(request, user, ...args);
      
    } catch (error) {
      console.error('Protected route error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Convenience functions for common role-based protections
export const withAdminAuth = (handler: (request: NextRequest, user: AuthenticatedUser, ...args: unknown[]) => Promise<NextResponse>) =>
  withAuth(handler, { allowedRoles: ['admin'] });

export const withManagerAuth = (handler: (request: NextRequest, user: AuthenticatedUser, ...args: unknown[]) => Promise<NextResponse>) =>
  withAuth(handler, { allowedRoles: ['admin', 'manager'] });

export const withUserAuth = (handler: (request: NextRequest, user: AuthenticatedUser, ...args: unknown[]) => Promise<NextResponse>) =>
  withAuth(handler, { allowedRoles: ['admin', 'manager', 'user'] });
