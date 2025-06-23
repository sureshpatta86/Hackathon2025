#!/usr/bin/env tsx

import bcrypt from 'bcryptjs';
import { db } from '../src/lib/db';

async function listUsers() {
  console.log('👥 Checking existing users...');

  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('📋 Existing users:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. Username: ${user.username}, Role: ${user.role}, Created: ${user.createdAt.toISOString()}`);
    });

    // Check if we can create a new admin user
    const adminUser = users.find(u => u.username === 'admin');
    if (adminUser) {
      console.log('\n🔄 Updating admin password to "admin"...');
      
      const saltRounds = 10;
      const hashedPassword = bcrypt.hashSync('admin', saltRounds);
      
      await db.user.update({
        where: { username: 'admin' },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Admin password updated successfully!');
      console.log('📝 Username: admin');
      console.log('📝 Password: admin');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function
listUsers()
  .then(() => {
    console.log('🎉 User check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Check failed:', error);
    process.exit(1);
  });
