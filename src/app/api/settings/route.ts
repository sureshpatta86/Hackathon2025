import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { validateAdmin } from '@/lib/auth-utils';

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

// POST /api/settings - Update settings (admin only)
export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    const { user: adminUser, error } = await validateAdmin(request);
    if (error || !adminUser) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messagingMode } = body;

    if (!['demo', 'live'].includes(messagingMode)) {
      return NextResponse.json(
        { error: 'Invalid messaging mode. Must be "demo" or "live"' },
        { status: 400 }
      );
    }

    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch {
      // .env file doesn't exist, create it
      envContent = '';
    }
    
    // Update the messaging mode in .env file
    const messagingModeRegex = /MESSAGING_MODE=.*/;
    if (messagingModeRegex.test(envContent)) {
      envContent = envContent.replace(messagingModeRegex, `MESSAGING_MODE=${messagingMode}`);
    } else {
      envContent += envContent.length > 0 ? `\nMESSAGING_MODE=${messagingMode}` : `MESSAGING_MODE=${messagingMode}`;
    }
    
    await fs.writeFile(envPath, envContent);
    
    // Update the environment variable for the current process
    process.env.MESSAGING_MODE = messagingMode;
    
    return NextResponse.json({
      success: true,
      messagingMode,
      message: `Messaging mode updated to ${messagingMode}. Changes applied immediately.`
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
