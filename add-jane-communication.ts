import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
    
    console.log('Found Jane Smith:', janeSmith.id);
    
    // Create a communication for Jane Smith
    const communication = await prisma.communication.create({
      data: {
        patientId: janeSmith.id,
        type: 'SMS',
        content: 'Hi Jane, this is a test message to verify the communication history display.',
        status: 'SENT',
        phoneNumber: janeSmith.phoneNumber,
        sentAt: new Date(),
      },
    });
    
    console.log('Created communication:', communication.id);
    
    // Verify it was created by fetching all communications for Jane Smith
    const janeComms = await prisma.communication.findMany({
      where: { patientId: janeSmith.id },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });
    
    console.log(`Jane Smith now has ${janeComms.length} communications:`);
    janeComms.forEach((comm, index) => {
      console.log(`  ${index + 1}. ${comm.type} - ${comm.status} - ${comm.content}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
