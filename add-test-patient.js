const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestPatient() {
  try {
    const patient = await prisma.patient.create({
      data: {
        firstName: 'Suresh',
        lastName: 'Patta',
        phoneNumber: '+1234567891',
        email: 'suresh.patta@example.com',
        smsEnabled: true,
        voiceEnabled: true,
        medicalNotes: 'Test patient for search functionality'
      }
    });
    
    console.log('Created test patient:', patient);
  } catch (error) {
    console.error('Error creating patient:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestPatient();
