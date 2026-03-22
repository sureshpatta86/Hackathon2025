import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    const user1Password = process.env.TEST_USER1_PASSWORD;
    const user2Password = process.env.TEST_USER2_PASSWORD;
    const testAdminPassword = process.env.TEST_ADMIN_PASSWORD;

    if (!user1Password || !user2Password || !testAdminPassword) {
      throw new Error(
        'Missing required environment variables: TEST_USER1_PASSWORD, TEST_USER2_PASSWORD, TEST_ADMIN_PASSWORD'
      );
    }

    console.log('Creating test users...');

    // Create test users with different roles
    const testUsers = [
      {
        username: 'user1',
        password: user1Password,
        role: 'user'
      },
      {
        username: 'user2',
        password: user2Password,
        role: 'user'
      },
      {
        username: 'testadmin',
        password: testAdminPassword,
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
