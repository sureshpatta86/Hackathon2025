import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { validateAdmin } from '@/lib/auth-utils';

const DEFAULT_BCRYPT_SALT_ROUNDS = 10;
const envSaltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || '', 10);
const BCRYPT_SALT_ROUNDS =
  Number.isInteger(envSaltRounds) && envSaltRounds > 0
    ? envSaltRounds
    : DEFAULT_BCRYPT_SALT_ROUNDS;

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const { user: adminUser, error } = await validateAdmin(request);
    if (error || !adminUser) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: 401 }
      );
    }
    
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password for security
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    const { user: adminUser, error } = await validateAdmin(request);
    if (error || !adminUser) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { username, password, role = 'user' } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'user'].includes(role)) {
      return NextResponse.json(
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS);

    // Create user
    try {
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    // Create user
    try {
      const user = await db.user.create({
        data: {
          username,
          password: hashedPassword,
          role,
        },
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          // Exclude password
        },
      });

      return NextResponse.json(user, { status: 201 });
    } catch (dbError: unknown) {
      // Handle specific database errors
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      if (errorMessage.includes('readonly database')) {
        return NextResponse.json(
          { 
            error: 'Database is in read-only mode. User creation is temporarily disabled in production. Please contact system administrator.',
            details: 'The database is not writable in the current deployment configuration.'
          },
          { status: 503 }
        );
      }
      
      // Re-throw other database errors
      throw dbError;
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
