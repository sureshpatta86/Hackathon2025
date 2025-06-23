const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createJaneSmithCommunications() {
  try {
    // Find Jane Smith
    const janeSmith = await prisma.patient.findFirst({
      where: {
        firstName: 'Jane',
        lastName: 'Smith',
      },
    });
    
    if (!janeSmith) {
      console.log('Jane Smith not found');
      return;
    }
    
    console.log('Creating communications for Jane Smith...');
    
    // Create some test communications for Jane Smith
    const communications = await Promise.all([
      prisma.communication.create({
        data: {
          patientId: janeSmith.id,
          type: 'SMS',
          content: 'Hi Jane, this is a reminder about your appointment tomorrow at 3 PM.',
          status: 'SENT',
          sentAt: new Date(),
        },
      }),
      prisma.communication.create({
        data: {
          patientId: janeSmith.id,
          type: 'SMS',
          content: 'Hello Jane, your lab results are now available. Please call to discuss.',
          status: 'DELIVERED',
          sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        },
      }),
      prisma.communication.create({
        data: {
          patientId: janeSmith.id,
          type: 'VOICE',
          content: 'Automated reminder call for Jane Smith regarding upcoming appointment.',
          status: 'DELIVERED',
          sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        },
      }),
    ]);
    
    console.log(`Created ${communications.length} communications for Jane Smith`);
    communications.forEach((comm, index) => {
      console.log(`  ${index + 1}. ${comm.type} - ${comm.status} - ${comm.content.substring(0, 50)}...`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createJaneSmithCommunications();
