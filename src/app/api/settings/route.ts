import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// GET /api/settings - Get current settings
export async function GET() {
  try {
    const messagingMode = process.env.MESSAGING_MODE || 'demo';
    const twilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
    
    return NextResponse.json({
      messagingMode,
      twilioConfigured,
      twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || null,
    });
  } catch (error) {
    console.error('Error reading settings:', error);
    return NextResponse.json(
      { error: 'Failed to read settings' },
      { status: 500 }
    );
  }
}

// POST /api/settings - Update settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messagingMode } = body;

    if (!['demo', 'live'].includes(messagingMode)) {
      return NextResponse.json(
        { error: 'Invalid messaging mode. Must be "demo" or "live"' },
        { status: 400 }
      );
    }

    const envPath = path.join(process.cwd(), '.env');
    let envContent = await fs.readFile(envPath, 'utf-8');
    
    // Update the messaging mode in .env file
    const messagingModeRegex = /MESSAGING_MODE=.*/;
    if (messagingModeRegex.test(envContent)) {
      envContent = envContent.replace(messagingModeRegex, `MESSAGING_MODE=${messagingMode}`);
    } else {
      envContent += `\nMESSAGING_MODE=${messagingMode}`;
    }
    
    await fs.writeFile(envPath, envContent);
    
    return NextResponse.json({
      success: true,
      messagingMode,
      message: `Messaging mode updated to ${messagingMode}. Restart the application to apply changes.`
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
