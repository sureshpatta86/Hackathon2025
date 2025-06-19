#!/usr/bin/env tsx

import { db } from '../src/lib/db';

async function createAdvancedDemo() {
  console.log('🚀 Creating advanced demo data...');

  try {
    // Create patient groups
    console.log('📁 Creating patient groups...');
    
    const diabetesGroup = await db.patientGroup.create({
      data: {
        name: 'Diabetes Patients',
        description: 'Patients with diabetes requiring regular monitoring',
        color: '#EF4444', // Red
      },
    });

    const elderlyGroup = await db.patientGroup.create({
      data: {
        name: 'Elderly Care',
        description: 'Patients 65+ requiring special attention',
        color: '#8B5CF6', // Purple
      },
    });

    const pregnancyGroup = await db.patientGroup.create({
      data: {
        name: 'Pregnancy Care',
        description: 'Expecting mothers for prenatal care',
        color: '#F59E0B', // Yellow
      },
    });

    // Create additional patients with more diverse data
    console.log('👥 Creating additional patients...');
    
    const additionalPatients = [
      {
        firstName: 'Maria',
        lastName: 'Rodriguez',
        phoneNumber: '+15551234567',
        email: 'maria.rodriguez@email.com',
        smsEnabled: true,
        voiceEnabled: false,
        medicalNotes: 'Type 2 diabetes, requires regular glucose monitoring',
      },
      {
        firstName: 'William',
        lastName: 'Chen',
        phoneNumber: '+15552345678',
        email: 'william.chen@email.com',
        smsEnabled: true,
        voiceEnabled: true,
        medicalNotes: 'Elderly patient, prefers morning appointments',
      },
      {
        firstName: 'Sarah',
        lastName: 'Thompson',
        phoneNumber: '+15553456789',
        email: 'sarah.thompson@email.com',
        smsEnabled: true,
        voiceEnabled: true,
        medicalNotes: 'First pregnancy, 28 weeks',
      },
      {
        firstName: 'David',
        lastName: 'Wilson',
        phoneNumber: '+15554567890',
        email: 'david.wilson@email.com',
        smsEnabled: false,
        voiceEnabled: true,
        medicalNotes: 'Hearing impaired, prefers voice calls',
      },
      {
        firstName: 'Lisa',
        lastName: 'Anderson',
        phoneNumber: '+15555678901',
        email: 'lisa.anderson@email.com',
        smsEnabled: true,
        voiceEnabled: true,
        medicalNotes: 'Type 1 diabetes, insulin dependent',
      },
    ];

    const createdPatients = [];
    for (const patientData of additionalPatients) {
      const patient = await db.patient.create({ data: patientData });
      createdPatients.push(patient);
    }

    // Assign patients to groups
    console.log('🏷️ Assigning patients to groups...');
    
    // Assign diabetes patients
    await db.patientGroupMember.createMany({
      data: [
        { patientId: createdPatients[0].id, groupId: diabetesGroup.id }, // Maria
        { patientId: createdPatients[4].id, groupId: diabetesGroup.id }, // Lisa
      ],
    });

    // Assign elderly patients
    await db.patientGroupMember.create({
      data: { patientId: createdPatients[1].id, groupId: elderlyGroup.id }, // William
    });

    // Assign pregnancy patients
    await db.patientGroupMember.create({
      data: { patientId: createdPatients[2].id, groupId: pregnancyGroup.id }, // Sarah
    });

    // Create advanced templates with more variety
    console.log('📝 Creating advanced message templates...');
    
    const advancedTemplates = [
      {
        name: 'Diabetes Reminder',
        type: 'SMS' as const,
        content: 'Hi {firstName}, this is a reminder to check your blood glucose levels and log your readings. Stay healthy! 🩺',
      },
      {
        name: 'Medication Refill Alert',
        type: 'SMS' as const,
        content: 'Hello {fullName}, your prescription is ready for pickup at the pharmacy. Please collect it within 7 days.',
      },
      {
        name: 'Prenatal Care Reminder',
        type: 'VOICE' as const,
        content: 'Hello {firstName}, this is a reminder about your upcoming prenatal appointment. Please remember to bring your insurance card and any questions you may have.',
      },
      {
        name: 'Lab Results Available',
        type: 'SMS' as const,
        content: 'Hi {firstName}, your lab results are now available in your patient portal. Please log in to view them or call us if you have questions.',
      },
      {
        name: 'Emergency Contact Update',
        type: 'VOICE' as const,
        content: 'This is an important message for {fullName}. Please call our office to update your emergency contact information. Thank you.',
      },
      {
        name: 'Insurance Verification',
        type: 'SMS' as const,
        content: 'Dear {lastName} family, please verify your insurance information is current by calling our office. This helps ensure smooth billing.',
      },
    ];

    for (const templateData of advancedTemplates) {
      await db.template.create({ data: templateData });
    }

    // Create some scheduled communications for future
    console.log('⏰ Creating scheduled communications...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0); // 2 PM next week

    await db.scheduledCommunication.createMany({
      data: [
        {
          patientId: createdPatients[0].id, // Maria
          type: 'SMS',
          content: 'Hi Maria, time for your daily glucose check reminder! 📊',
          scheduledFor: tomorrow,
        },
        {
          groupId: pregnancyGroup.id,
          type: 'SMS', 
          content: 'Weekly prenatal care reminder: Stay hydrated and take your vitamins! 💊',
          scheduledFor: nextWeek,
          isRecurring: true,
          recurrencePattern: '{"type": "weekly", "interval": 1, "daysOfWeek": [1]}',
        },
      ],
    });

    // Create some sample communications for analytics
    console.log('📊 Creating sample communication history...');
    
    const sampleCommunications = [
      {
        patientId: createdPatients[0].id,
        type: 'SMS' as const,
        content: 'Your appointment reminder was sent successfully',
        phoneNumber: createdPatients[0].phoneNumber,
        status: 'DELIVERED' as const,
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 30000), // 30 seconds later
      },
      {
        patientId: createdPatients[1].id,
        type: 'VOICE' as const,
        content: 'Appointment confirmation call completed',
        phoneNumber: createdPatients[1].phoneNumber,
        status: 'DELIVERED' as const,
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 48 + 45000), // 45 seconds later
      },
      {
        patientId: createdPatients[2].id,
        type: 'SMS' as const,
        content: 'Prenatal vitamin reminder sent',
        phoneNumber: createdPatients[2].phoneNumber,
        status: 'DELIVERED' as const,
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
        deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 72 + 20000), // 20 seconds later
      },
      {
        patientId: createdPatients[3].id,
        type: 'SMS' as const,
        content: 'Failed delivery example',
        phoneNumber: '+15550000000', // Invalid number
        status: 'FAILED' as const,
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 96), // 4 days ago
        failedAt: new Date(Date.now() - 1000 * 60 * 60 * 96 + 10000), // 10 seconds later
        errorMessage: 'Invalid phone number',
      },
    ];

    for (const commData of sampleCommunications) {
      await db.communication.create({ data: commData });
    }

    // Create some sample appointments
    console.log('📅 Creating sample appointments...');
    
    const sampleAppointments = [
      {
        patientId: createdPatients[0].id,
        title: 'Diabetes Check-up',
        description: 'Regular monitoring and glucose level assessment',
        appointmentDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
        status: 'SCHEDULED' as const,
      },
      {
        patientId: createdPatients[2].id,
        title: 'Prenatal Appointment',
        description: '30-week prenatal check-up and ultrasound',
        appointmentDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week from now
        status: 'SCHEDULED' as const,
      },
      {
        patientId: createdPatients[1].id,
        title: 'Annual Physical',
        description: 'Comprehensive annual health examination',
        appointmentDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 2 weeks from now
        status: 'SCHEDULED' as const,
      },
    ];

    for (const apptData of sampleAppointments) {
      await db.appointment.create({ data: apptData });
    }

    console.log('✅ Advanced demo data created successfully!');
    console.log('');
    console.log('🎯 Demo Features Available:');
    console.log('- 📱 Bulk Messaging: Send to groups or multiple patients');
    console.log('- 🏷️ Patient Groups: Organize patients by condition/department');
    console.log('- 📊 Analytics Dashboard: View communication success rates');
    console.log('- 📋 CSV Import: Bulk import patients from spreadsheet');
    console.log('- ⏰ Scheduled Messages: Plan future communications');
    console.log('- 🎯 Advanced Templates: More sophisticated message templates');
    console.log('- 📈 Communication Tracking: Monitor delivery status');
    console.log('');
    console.log('🚀 Ready to explore all features at http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  }
}

// Run the demo creation
createAdvancedDemo()
  .then(() => {
    console.log('🎉 Advanced demo setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
