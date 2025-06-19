import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendMessage } from '@/lib/messaging';
import { replaceTemplateVariables } from '@/lib/templateVariables';
import { sendCommunicationSchema, validateRequestBody } from '@/lib/validation';

// GET /api/communications - Get communication history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: {
      patientId?: string;
      type?: 'SMS' | 'VOICE';
      status?: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
    } = {};
    
    if (patientId) {
      where.patientId = patientId;
    }
    
    if (type && ['SMS', 'VOICE'].includes(type)) {
      where.type = type as 'SMS' | 'VOICE';
    }
    
    if (status && ['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED'].includes(status)) {
      where.status = status as 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
    }

    const communications = await db.communication.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
        appointment: {
          select: {
            id: true,
            title: true,
            appointmentDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to recent 100 communications
    });

    return NextResponse.json(communications);
  } catch (error) {
    console.error('Error fetching communications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communications' },
      { status: 500 }
    );
  }
}

// POST /api/communications - Send a new message
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequestBody(request, sendCommunicationSchema);
    if (!validation.success) {
      return NextResponse.json(validation.error, { status: 400 });
    }

    const { patientId, type, content, phoneNumber, templateId } = validation.data;

    console.log('Sending message:', { patientId, type, content: content?.substring(0, 50), phoneNumber });

    // PatientId is required for this API - ensure we have it
    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required for communications' },
        { status: 400 }
      );
    }

    // Verify patient exists
    const patient = await db.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // If templateId is provided, verify template exists
    let template = null;
    if (templateId) {
      template = await db.template.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
    }

    // Get appointment data if available (for template variables)
    let appointment = null;
    if (patient) {
      // Get the most recent or upcoming appointment for this patient
      appointment = await db.appointment.findFirst({
        where: { patientId: patient.id },
        orderBy: { appointmentDate: 'desc' }
      });
    }

    // Replace template variables with actual data
    const processedContent = replaceTemplateVariables(
      content, 
      patient, 
      appointment || undefined
    );
    
    console.log('Original content:', content);
    console.log('Processed content:', processedContent);

    // Send the actual message using Twilio
    const messageResult = await sendMessage(type as 'SMS' | 'VOICE', phoneNumber || patient.phoneNumber, processedContent);
    
    console.log('Message result:', messageResult);

    // Create the communication record with actual delivery status
    const communicationData = {
      patientId,
      type: type as 'SMS' | 'VOICE',
      content: processedContent,
      phoneNumber: phoneNumber || patient.phoneNumber,
      templateId: templateId || null,
      sentAt: new Date(),
      status: messageResult.status,
      deliveredAt: messageResult.success ? new Date() : null,
      failedAt: messageResult.success ? null : new Date(),
      errorMessage: messageResult.success ? null : (messageResult.error || 'Unknown error'),
      twilioSid: messageResult.success ? messageResult.messageId : null,
    };

    const communication = await db.communication.create({
      data: communicationData,
      include: {
        patient: patientId ? {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        } : undefined,
        template: templateId ? {
          select: {
            id: true,
            name: true,
          },
        } : undefined,
      },
    });

    console.log('Message sent successfully:', communication.id, communication.status);
    return NextResponse.json(communication, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
