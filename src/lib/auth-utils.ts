import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

// Simple JWT-like token validation
export function validateToken(token: string): { valid: boolean; userId?: string; role?: string } {
  try {
    if (!token || token.length < 10) {
      return { valid: false };
    }
    
    // Format: "userId:role:timestamp"
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

export async function validateUser(request: NextRequest) {
  // Get token from cookies or Authorization header
  const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return { user: null, error: 'No authentication token provided' };
  }
  
  const validation = validateToken(token);
  
  if (!validation.valid || !validation.userId) {
    return { user: null, error: 'Invalid authentication token' };
  }
  
  try {
    // Get user from database
    const user = await db.user.findUnique({
      where: { id: validation.userId },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    if (!user) {
      return { user: null, error: 'User not found' };
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('Database error during user validation:', error);
    return { user: null, error: 'Database error' };
  }
}

export async function validateAdmin(request: NextRequest) {
  const { user, error } = await validateUser(request);
  
  if (error || !user) {
    return { user: null, error: error || 'User not found' };
  }
  
  if (user.role !== 'admin') {
    return { user: null, error: 'Admin access required' };
  }
  
  return { user, error: null };
}
