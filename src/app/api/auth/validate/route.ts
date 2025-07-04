import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Simple JWT-like token validation (replace with your preferred auth solution)
function validateToken(token: string): { valid: boolean; userId?: string; role?: string } {
  try {
    // This is a simplified validation - replace with proper JWT verification
    // For now, we'll just check if the token exists and matches a pattern
    if (!token || token.length < 10) {
      return { valid: false };
    }
    
    // In a real app, you would:
    // 1. Verify JWT signature
    // 2. Check expiration
    // 3. Validate against database
    // 4. Return user info
    
    // For demo purposes, we'll extract info from a simple token format
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

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies or Authorization header
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }
    
    const validation = validateToken(token);
    
    if (!validation.valid || !validation.userId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Fetch actual user details from database
    try {
      const user = await db.user.findUnique({
        where: { id: validation.userId },
        select: {
          id: true,
          username: true,
          role: true,
          // Exclude password for security
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        valid: true,
        user
      });
    } catch (dbError) {
      console.error('Database error during user fetch:', dbError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Auth validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
