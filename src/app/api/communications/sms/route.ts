import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendSMS } from '@/lib/twilio';

// POST /api/communications/sms - Send SMS message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, templateId, appointmentId, customMessage } = body;

    // Validation
    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      );
    }

    // Get patient information
    const patient = await db.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    if (!patient.smsEnabled) {
      return NextResponse.json(
        { error: 'SMS is disabled for this patient' },
        { status: 400 }
      );
    }

    // Get template if provided
    let template = null;
    if (templateId) {
      template = await db.template.findUnique({
        where: { id: templateId, type: 'SMS' },
      });
    }

    // Determine message content
    let messageContent = customMessage;
    if (template && !customMessage) {
      messageContent = template.content;
      
      // Replace template variables
      if (template.variables) {
        const variables = JSON.parse(template.variables);
        messageContent = messageContent.replace(/\{(\w+)\}/g, (_match: string, key: string) => {
          return variables[key] || _match;
        });
      }
      
      // Replace patient variables
      messageContent = messageContent
        .replace(/\{firstName\}/g, patient.firstName)
        .replace(/\{lastName\}/g, patient.lastName)
        .replace(/\{fullName\}/g, `${patient.firstName} ${patient.lastName}`);
        
      // Replace appointment variables if appointment is provided
      if (appointmentId) {
        const appointment = await db.appointment.findUnique({
          where: { id: appointmentId },
        });
        
        if (appointment) {
          messageContent = messageContent
            .replace(/\{appointmentDate\}/g, appointment.appointmentDate.toLocaleDateString())
            .replace(/\{appointmentTime\}/g, appointment.appointmentDate.toLocaleTimeString())
            .replace(/\{appointmentTitle\}/g, appointment.title);
        }
      }
    }

    if (!messageContent) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Create communication record
    const communication = await db.communication.create({
      data: {
        patientId,
        templateId,
        appointmentId,
        type: 'SMS',
        content: messageContent,
        phoneNumber: patient.phoneNumber,
        status: 'PENDING',
      },
    });

    // Send SMS
    const smsResult = await sendSMS(patient.phoneNumber, messageContent);

    // Update communication record with result
    const updatedCommunication = await db.communication.update({
      where: { id: communication.id },
      data: {
        status: smsResult.success ? 'SENT' : 'FAILED',
        twilioSid: smsResult.sid,
        sentAt: smsResult.success ? new Date() : null,
        failedAt: smsResult.success ? null : new Date(),
        errorMessage: smsResult.success ? null : smsResult.error,
      },
    });

    return NextResponse.json({
      communication: updatedCommunication,
      result: smsResult,
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}
