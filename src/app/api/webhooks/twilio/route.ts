import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/webhooks/twilio - Handle Twilio delivery status webhooks
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const messageSid = formData.get('MessageSid') || formData.get('CallSid');
    const messageStatus = formData.get('MessageStatus') || formData.get('CallStatus');
    
    if (!messageSid || !messageStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the communication record
    const communication = await db.communication.findFirst({
      where: { twilioSid: messageSid as string },
    });

    if (!communication) {
      console.log(`Communication not found for SID: ${messageSid}`);
      return NextResponse.json({ message: 'Communication not found' }, { status: 404 });
    }

    // Map Twilio status to our status
    let status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CANCELLED' = 'PENDING';
    let deliveredAt: Date | null = null;
    let failedAt: Date | null = null;

    switch (messageStatus) {
      case 'sent':
      case 'queued':
      case 'sending':
        status = 'SENT';
        break;
      case 'delivered':
      case 'received':
        status = 'DELIVERED';
        deliveredAt = new Date();
        break;
      case 'failed':
      case 'undelivered':
        status = 'FAILED';
        failedAt = new Date();
        break;
      case 'cancelled':
        status = 'CANCELLED';
        failedAt = new Date();
        break;
    }

    // Update the communication record
    await db.communication.update({
      where: { id: communication.id },
      data: {
        status,
        deliveredAt,
        failedAt,
      },
    });

    console.log(`Updated communication ${communication.id} status to ${status}`);
    return NextResponse.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error handling Twilio webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
