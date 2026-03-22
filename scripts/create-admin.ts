#!/usr/bin/env tsx

import bcrypt from 'bcryptjs';
import { db } from '../src/lib/db';

const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminPassword) {
  throw new Error('ADMIN_PASSWORD environment variable is required');
}

async function createAdminUser() {
  console.log('👤 Creating admin user...');

  try {
    // Check if admin user already exists
    const existingUser = await db.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingUser) {
      console.log('✅ Admin user already exists');

    // Create admin user with hashed password
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(adminPassword, saltRounds);
    
    await db.user.create({
      data: {
    await db.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'admin',

    console.log('✅ Admin user created successfully!');
    console.log('📝 Username: admin');
    console.log('📝 Password: [provided via ADMIN_PASSWORD]');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Run the admin user creation
createAdminUser()
  .then(() => {
    console.log('🎉 Admin setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
