import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { loginSchema, validateRequestBody } from '@/lib/validation';

// Simple token generation (replace with proper JWT in production)
function generateToken(userId: string, role: string): string {
  const timestamp = Date.now();
  // In production, use proper JWT with secret key and expiration
  return `${userId}:${role}:${timestamp}`;
}

// POST /api/auth/login - User authentication
export async function POST(request: NextRequest) {
  try {
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
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

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
