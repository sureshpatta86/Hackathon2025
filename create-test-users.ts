import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const userPassword = process.env.TEST_USER_PASSWORD;
  const adminPassword = process.env.TEST_ADMIN_PASSWORD;

  if (!userPassword || !adminPassword) {
    throw new Error(
      'Missing required environment variables: TEST_USER_PASSWORD and TEST_ADMIN_PASSWORD'
    );
  }

  try {
    console.log('Creating test users...');

    // Create test users with different roles
    const testUsers = [
      {
        username: 'user1',
        password: userPassword,
        role: 'user'
      },
      {
        username: 'user2',
        password: userPassword,
        role: 'user'
      },
      {
        username: 'testadmin',
        password: adminPassword,
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
