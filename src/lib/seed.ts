import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Check if data already exists
  const existingPatients = await prisma.patient.count();
  const existingTemplates = await prisma.template.count();
  const existingCommunications = await prisma.communication.count();

  if (existingPatients > 0 && existingTemplates > 0 && existingCommunications > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log(`Found ${existingPatients} patients, ${existingTemplates} templates, ${existingCommunications} communications`);

  // Create sample templates only if none exist
  if (existingTemplates === 0) {
    console.log('Creating sample templates...');

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
  }

  // Create sample patients only if none exist
  if (existingPatients === 0) {
    console.log('Creating sample patients...');

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
  }

  // Create sample communications only if none exist
  if (existingCommunications === 0) {
    console.log('Creating sample communications...');

    // Get created patients and templates for sample communications
    const createdPatients = await prisma.patient.findMany();
    const createdTemplates = await prisma.template.findMany();

    if (createdPatients.length > 0 && createdTemplates.length > 0) {
      const sampleCommunications = [
        {
          patientId: createdPatients[0].id,
          templateId: createdTemplates[0].id,
          type: 'SMS' as const,
          status: 'DELIVERED' as const,
          phoneNumber: createdPatients[0].phoneNumber,
          content: 'Hi John, this is a reminder about your appointment on June 25 at 2:00 PM. Please call us if you need to reschedule.',
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5000), // 5 seconds after sent
        },
        {
          patientId: createdPatients[1].id,
          templateId: createdTemplates[1].id,
          type: 'SMS' as const,
          status: 'DELIVERED' as const,
          phoneNumber: createdPatients[1].phoneNumber,
          content: 'Hello Jane, your prescription is ready for pickup at our pharmacy. Our hours are Monday-Friday 9AM-6PM.',
          sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3000), // 3 seconds after sent
        },
        {
          patientId: createdPatients[2].id,
          templateId: createdTemplates[4]?.id || createdTemplates[0].id, // Voice template or fallback
          type: 'VOICE' as const,
          status: 'DELIVERED' as const,
          phoneNumber: createdPatients[2].phoneNumber,
          content: 'Hello Robert, this is Healthcare Center calling to confirm your appointment on June 26 at 10:00 AM.',
          sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          deliveredAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 8000), // 8 seconds after sent
        },
        {
          patientId: createdPatients[0].id,
          templateId: createdTemplates[2].id,
          type: 'SMS' as const,
          status: 'FAILED' as const,
          phoneNumber: createdPatients[0].phoneNumber,
          content: 'Hi John, your lab results are now available. Please call our office to discuss.',
          sentAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          failedAt: new Date(Date.now() - 30 * 60 * 1000 + 10000), // 10 seconds after sent
          errorMessage: 'Phone number temporarily unavailable'
        },
        {
          patientId: createdPatients[1].id,
          templateId: createdTemplates[3].id,
          type: 'SMS' as const,
          status: 'DELIVERED' as const,
          phoneNumber: createdPatients[1].phoneNumber,
          content: 'Dear Jane, please schedule a follow-up appointment within the next two weeks. Call us at (555) 123-4567.',
          sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          deliveredAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 2000), // 2 seconds after sent
        }
      ];

      for (const communication of sampleCommunications) {
        await prisma.communication.create({
          data: communication
        });
      }
    }

    // Create sample appointments
    if (createdPatients.length > 0) {
      const sampleAppointments = [
        {
          patientId: createdPatients[0].id,
          title: 'Annual Checkup',
          description: 'Regular health screening and consultation',
          appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          duration: 45,
          status: 'SCHEDULED' as const,
        },
        {
          patientId: createdPatients[1].id,
          title: 'Follow-up Consultation',
          description: 'Review test results and treatment plan',
          appointmentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          duration: 30,
          status: 'CONFIRMED' as const,
        },
        {
          patientId: createdPatients[2].id,
          title: 'Physical Therapy',
          description: 'Weekly physical therapy session',
          appointmentDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
          duration: 60,
          status: 'SCHEDULED' as const,
        }
      ];

      for (const appointment of sampleAppointments) {
        await prisma.appointment.create({
          data: appointment
        });
      }
    }
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
