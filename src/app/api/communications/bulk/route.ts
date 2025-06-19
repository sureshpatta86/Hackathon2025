import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendSMS, makeVoiceCall, formatMessageForVoice } from '@/lib/twilio';

// POST /api/communications/bulk - Send bulk messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      patientIds, 
      groupId, 
      templateId, 
      customMessage, 
      type, 
      scheduleFor 
    } = body;

    // Validation
    if (!type || !['SMS', 'VOICE'].includes(type)) {
      return NextResponse.json(
        { error: 'Valid type (SMS or VOICE) is required' },
        { status: 400 }
      );
    }

    if (!patientIds && !groupId) {
      return NextResponse.json(
        { error: 'Either patientIds or groupId is required' },
        { status: 400 }
      );
    }

    // Get patients to message
    interface PatientData {
      id: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      smsEnabled: boolean;
      voiceEnabled: boolean;
    }
    
    let patients: PatientData[] = [];
    
    if (groupId) {
      const group = await db.patientGroup.findUnique({
        where: { id: groupId },
        include: {
          patients: {
            include: {
              patient: true,
            },
          },
        },
      });
      
      if (!group) {
        return NextResponse.json(
          { error: 'Patient group not found' },
          { status: 404 }
        );
      }
      
      patients = group.patients.map(pm => pm.patient);
    } else if (patientIds && Array.isArray(patientIds)) {
      patients = await db.patient.findMany({
        where: {
          id: { in: patientIds },
        },
      });
    }

    if (patients.length === 0) {
      return NextResponse.json(
        { error: 'No patients found to message' },
        { status: 400 }
      );
    }

    // Get template if provided
    let template = null;
    if (templateId) {
      template = await db.template.findUnique({
        where: { id: templateId, type },
      });
    }

    // If scheduling for future, create scheduled communications
    if (scheduleFor) {
      const scheduledDate = new Date(scheduleFor);
      if (scheduledDate <= new Date()) {
        return NextResponse.json(
          { error: 'Scheduled time must be in the future' },
          { status: 400 }
        );
      }

      const scheduledCommunications = await Promise.all(
        patients.map(patient =>
          db.scheduledCommunication.create({
            data: {
              patientId: patient.id,
              templateId,
              type,
              content: customMessage || template?.content || '',
              scheduledFor: scheduledDate,
            },
          })
        )
      );

      return NextResponse.json({
        message: `${scheduledCommunications.length} messages scheduled for ${scheduledDate.toLocaleString()}`,
        scheduledCount: scheduledCommunications.length,
        scheduledCommunications,
      });
    }

    // Send messages immediately
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const patient of patients) {
      // Check patient preferences
      if (type === 'SMS' && !patient.smsEnabled) {
        results.push({
          patientId: patient.id,
          patient: `${patient.firstName} ${patient.lastName}`,
          success: false,
          error: 'SMS disabled for this patient',
        });
        failureCount++;
        continue;
      }

      if (type === 'VOICE' && !patient.voiceEnabled) {
        results.push({
          patientId: patient.id,
          patient: `${patient.firstName} ${patient.lastName}`,
          success: false,
          error: 'Voice calls disabled for this patient',
        });
        failureCount++;
        continue;
      }

      // Prepare message content
      let messageContent = customMessage || template?.content || '';
      
      // Replace patient variables
      messageContent = messageContent
        .replace(/\{firstName\}/g, patient.firstName)
        .replace(/\{lastName\}/g, patient.lastName)
        .replace(/\{fullName\}/g, `${patient.firstName} ${patient.lastName}`);

      // Create communication record
      const communication = await db.communication.create({
        data: {
          patientId: patient.id,
          templateId,
          type,
          content: messageContent,
          phoneNumber: patient.phoneNumber,
          status: 'PENDING',
        },
      });

      // Send message
      let result;
      if (type === 'SMS') {
        result = await sendSMS(patient.phoneNumber, messageContent);
      } else {
        const voiceMessage = formatMessageForVoice(messageContent);
        result = await makeVoiceCall(patient.phoneNumber, voiceMessage);
      }

      // Update communication record
      await db.communication.update({
        where: { id: communication.id },
        data: {
          status: result.success ? 'SENT' : 'FAILED',
          twilioSid: result.sid,
          sentAt: result.success ? new Date() : null,
          failedAt: result.success ? null : new Date(),
          errorMessage: result.success ? null : result.error,
        },
      });

      results.push({
        patientId: patient.id,
        patient: `${patient.firstName} ${patient.lastName}`,
        success: result.success,
        communicationId: communication.id,
        twilioSid: result.sid,
        error: result.error,
      });

      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    return NextResponse.json({
      message: `Bulk ${type.toLowerCase()} completed`,
      totalPatients: patients.length,
      successCount,
      failureCount,
      results,
    });
  } catch (error) {
    console.error('Error sending bulk messages:', error);
    return NextResponse.json(
      { error: 'Failed to send bulk messages' },
      { status: 500 }
    );
  }
}
