import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { validateAdmin } from '@/lib/auth-utils';

// GET /api/users/[id] - Get a specific user (admin only)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Validate admin access
    const { user: adminUser, error } = await validateAdmin(request);
    if (error || !adminUser) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: 401 }
      );
    }
    
    const { id } = await context.params;
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update a user (admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
    const { username, password, role } = body;

    // Validate role if provided
    if (role && !['admin', 'user'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be either "admin" or "user"' },
        { status: 400 }
      );
    }

    const { id } = await context.params;

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if username is taken by another user
    if (username && username !== existingUser.username) {
      const userWithSameUsername = await db.user.findUnique({
        where: { username },
      });

      if (userWithSameUsername) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      username?: string;
      password?: string;
      role?: string;
    } = {};

    if (username) updateData.username = username;
    if (role) updateData.role = role;
    
    // Hash password if provided
    if (password) {
      const saltRounds = 10;
      updateData.password = bcrypt.hashSync(password, saltRounds);
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user (admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Validate admin access
    const { user: adminUser, error } = await validateAdmin(request);
    if (error || !adminUser) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: 401 }
      );
    }
    
    const { id } = await context.params;
    
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting admin users (safety measure)
    if (existingUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Delete user
    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
