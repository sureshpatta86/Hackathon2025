#!/usr/bin/env tsx

import bcrypt from 'bcryptjs';
import { db } from '../src/lib/db';

async function recreateAdminUser() {
  console.log('🔄 Recreating admin user with hashed password...');

  try {
    // Delete existing admin user if exists
    await db.user.deleteMany({
      where: { username: 'admin' }
    });
    
    console.log('🗑️ Deleted existing admin user');

    // Create new admin user with hashed password
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync('admin', saltRounds);
    
    await db.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
      },
    });

    console.log('✅ Admin user recreated with hashed password!');
    console.log('📝 Use username "admin" with password "admin" to login');
    console.log('🔒 Password is now properly hashed in the database');
    
  } catch (error) {
    console.error('❌ Error recreating admin user:', error);
  }
}

// Run the recreation
recreateAdminUser()
  .then(() => {
    console.log('🎉 Admin user recreation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Recreation failed:', error);
    process.exit(1);
  });
