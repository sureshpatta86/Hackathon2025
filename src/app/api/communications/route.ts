import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendMessage } from '@/lib/messaging';
import { replaceTemplateVariables } from '@/lib/templateVariables';

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
    const body = await request.json();
    const { patientId, type, content, phoneNumber, templateId } = body;

    console.log('Sending message:', { patientId, type, content: content?.substring(0, 50), phoneNumber });

    // Validate required fields
    if (!patientId || !type || !content || !phoneNumber) {
      console.error('Missing required fields:', { patientId: !!patientId, type: !!type, content: !!content, phoneNumber: !!phoneNumber });
      return NextResponse.json(
        { error: 'Missing required fields: patientId, type, content, phoneNumber' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['SMS', 'VOICE'].includes(type)) {
      console.error('Invalid message type:', type);
      return NextResponse.json(
        { error: 'Invalid message type. Must be SMS or VOICE' },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!phoneNumber || phoneNumber.length < 10) {
      console.error('Invalid phone number:', phoneNumber);
      return NextResponse.json(
        { error: 'Invalid phone number format. Please provide a valid phone number with country code (e.g., +1234567890 or +918374026999)' },
        { status: 400 }
      );
    }

    // Check if patient exists
    const patient = await db.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      console.error('Patient not found:', patientId);
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    console.log('Found patient:', patient.firstName, patient.lastName);

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
    const messageResult = await sendMessage(type as 'SMS' | 'VOICE', phoneNumber, processedContent);
    
    console.log('Message result:', messageResult);

    // Create the communication record with actual delivery status
    const communicationData: {
      patientId: string;
      type: 'SMS' | 'VOICE';
      content: string;
      phoneNumber: string;
      templateId: string | null;
      sentAt: Date;
      status: 'DELIVERED' | 'FAILED' | 'PENDING';
      deliveredAt?: Date;
      failedAt?: Date;
      errorMessage?: string;
      twilioSid?: string;
    } = {
      patientId,
      type: type as 'SMS' | 'VOICE',
      content: processedContent, // Store the processed content with variables replaced
      phoneNumber,
      templateId: templateId || null,
      sentAt: new Date(),
      status: messageResult.status,
    };

    // Set additional fields based on message result
    if (messageResult.success) {
      communicationData.deliveredAt = new Date();
      communicationData.twilioSid = messageResult.messageId;
    } else {
      communicationData.failedAt = new Date();
      communicationData.errorMessage = messageResult.error || 'Unknown error';
    }

    const communication = await db.communication.create({
      data: communicationData,
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
