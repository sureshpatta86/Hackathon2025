import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample templates
  const smsTemplates = [
    {
      name: 'Appointment Reminder',
      type: 'SMS' as const,
      content: 'Hi {firstName}, this is a reminder about your appointment on {appointmentDate} at {appointmentTime}. Please call us if you need to reschedule.',
      variables: JSON.stringify({
        firstName: 'Patient first name',
        appointmentDate: 'Appointment date',
        appointmentTime: 'Appointment time'
      })
    },
    {
      name: 'Prescription Ready',
      type: 'SMS' as const,
      content: 'Hello {firstName}, your prescription is ready for pickup at our pharmacy. Our hours are Monday-Friday 9AM-6PM.',
      variables: JSON.stringify({
        firstName: 'Patient first name'
      })
    },
    {
      name: 'Lab Results Available',
      type: 'SMS' as const,
      content: 'Hi {firstName}, your lab results are now available. Please call our office at (555) 123-4567 to discuss the results with your doctor.',
      variables: JSON.stringify({
        firstName: 'Patient first name'
      })
    },
    {
      name: 'Follow-up Required',
      type: 'SMS' as const,
      content: 'Dear {firstName}, please schedule a follow-up appointment within the next two weeks. Call us at (555) 123-4567.',
      variables: JSON.stringify({
        firstName: 'Patient first name'
      })
    }
  ];

  const voiceTemplates = [
    {
      name: 'Appointment Confirmation',
      type: 'VOICE' as const,
      content: 'Hello {firstName}, this is Healthcare Center calling to confirm your appointment on {appointmentDate} at {appointmentTime}. Please press 1 to confirm or call us back at 555-123-4567 if you need to reschedule.',
      variables: JSON.stringify({
        firstName: 'Patient first name',
        appointmentDate: 'Appointment date',
        appointmentTime: 'Appointment time'
      }),
      voiceSpeed: 0.9,
      voicePitch: 0.0
    },
    {
      name: 'Test Results Notification',
      type: 'VOICE' as const,
      content: 'Hello {firstName}, this is Healthcare Center. Your test results are ready. Please call our office at 555-123-4567 to schedule an appointment to discuss your results with the doctor.',
      variables: JSON.stringify({
        firstName: 'Patient first name'
      }),
      voiceSpeed: 0.8,
      voicePitch: 0.0
    },
    {
      name: 'Medication Reminder',
      type: 'VOICE' as const,
      content: 'Hello {firstName}, this is a reminder to take your prescribed medication as directed by your doctor. If you have any questions about your medication, please call our office.',
      variables: JSON.stringify({
        firstName: 'Patient first name'
      }),
      voiceSpeed: 0.9,
      voicePitch: 0.0
    }
  ];

  // Insert SMS templates
  for (const template of smsTemplates) {
    await prisma.template.create({
      data: template
    });
  }

  // Insert Voice templates
  for (const template of voiceTemplates) {
    await prisma.template.create({
      data: template
    });
  }

  // Create sample patients
  const samplePatients = [
    {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      email: 'john.doe@example.com',
      smsEnabled: true,
      voiceEnabled: true,
      medicalNotes: 'Regular checkup patient'
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+1987654321',
      email: 'jane.smith@example.com',
      smsEnabled: true,
      voiceEnabled: false,
      medicalNotes: 'Prefers SMS communication only'
    },
    {
      firstName: 'Robert',
      lastName: 'Johnson',
      phoneNumber: '+1555123456',
      email: null,
      smsEnabled: false,
      voiceEnabled: true,
      medicalNotes: 'Elderly patient, prefers voice calls'
    }
  ];

  for (const patient of samplePatients) {
    await prisma.patient.create({
      data: patient
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
