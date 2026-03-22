import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { loginSchema, validateRequestBody } from '@/lib/validation';

// Simple signed token generation using environment secret
function generateToken(userId: string, role: string, secret: string): string {
  const timestamp = Date.now();
  const payload = `${userId}:${role}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return `${payload}:${signature}`;
}

// POST /api/auth/login - User authentication
export async function POST(request: NextRequest) {
  try {
    const authTokenSecret = process.env.AUTH_TOKEN_SECRET;
    if (!authTokenSecret) {
      throw new Error('AUTH_TOKEN_SECRET is not configured');
    }

    // Validate request body
    const validation = await validateRequestBody(request, loginSchema);
    if (!validation.success) {
      return NextResponse.json(validation.error, { status: 400 });
    }

    const { username, password } = validation.data;

    // Find user in database
    const user = await db.user.findUnique({
      where: { username },
    });

    // Check if user exists and password matches
    // Use bcrypt to compare the hashed password
    }

    // Generate authentication token
    const token = generateToken(user.id, user.role, authTokenSecret);
    
    // Return user data (excluding password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // Generate authentication token
    const token = generateToken(user.id, user.role);
    
    // Return user data (excluding password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    
    // Create response with user data and token
    const response = NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
    
    // Set authentication cookies
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    response.cookies.set('user-session', JSON.stringify(userWithoutPassword), {
      httpOnly: false, // Accessible to client-side JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
