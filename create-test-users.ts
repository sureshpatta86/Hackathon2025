import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating test users...');

    // Create test users with different roles
    const testUsers = [
      {
        username: 'user1',
        password: 'password123',
        role: 'user'
      },
      {
        username: 'user2',
        password: 'password123',
        role: 'user'
      },
      {
        username: 'testadmin',
        password: 'admin123',
        role: 'admin'
      }
    ];

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: userData.username },
      });

      if (existingUser) {
        console.log(`User ${userData.username} already exists, skipping...`);
        continue;
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = bcrypt.hashSync(userData.password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          password: hashedPassword,
          role: userData.role,
        },
        select: {
          id: true,
          username: true,
          role: true,
        },
      });

      console.log(`Created user: ${user.username} (${user.role})`);
    }

    // Display all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('\nAll users in database:');
    console.table(allUsers);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
