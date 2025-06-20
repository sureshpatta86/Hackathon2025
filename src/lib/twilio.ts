// Check if Twilio environment variables are configured
const isTwilioConfigured = 
  process.env.TWILIO_ACCOUNT_SID && 
  process.env.TWILIO_AUTH_TOKEN && 
  process.env.TWILIO_PHONE_NUMBER;

export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Function to get Twilio client when needed
async function getTwilioClient() {
  if (!isTwilioConfigured) {
    return null;
  }
  
  const { default: twilio } = await import('twilio');
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );
}

// SMS sending function
export async function sendSMS(to: string, body: string) {
  const twilioClient = await getTwilioClient();
  
  if (!twilioClient || !TWILIO_PHONE_NUMBER) {
    console.warn('Twilio not configured - SMS would be sent:', { to, body });
    return {
      success: true,
      sid: 'demo-sms-' + Math.random().toString(36).substr(2, 9),
      status: 'sent',
      demo: true,
    };
  }

  try {
    const message = await twilioClient.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER,
      to,
    });
    
    return {
      success: true,
      sid: message.sid,
      status: message.status,
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Voice call function
export async function makeVoiceCall(to: string, message: string) {
  const twilioClient = await getTwilioClient();
  
  if (!twilioClient || !TWILIO_PHONE_NUMBER) {
    console.warn('Twilio not configured - Voice call would be made:', { to, message });
    return {
      success: true,
      sid: 'demo-voice-' + Math.random().toString(36).substr(2, 9),
      status: 'initiated',
      demo: true,
    };
  }

  try {
    const call = await twilioClient.calls.create({
      twiml: `<Response><Say voice="alice" rate="medium">${message}</Say></Response>`,
      from: TWILIO_PHONE_NUMBER,
      to,
    });
    
    return {
      success: true,
      sid: call.sid,
      status: call.status,
    };
  } catch (error) {
    console.error('Error making voice call:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Helper functions for phone number validation and formatting
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic validation for international phone numbers
  // Must start with + followed by 1-3 digit country code and at least 7 digits total
  const phoneRegex = /^\+[1-9]\d{7,15}$/;
  return phoneRegex.test(phoneNumber);
}

export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Add + if not present and doesn't start with +
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

export function formatMessageForVoice(message: string): string {
  // Convert message to be more voice-friendly
  return message
    .replace(/&/g, 'and')
    .replace(/\$/g, 'dollars')
    .replace(/@/g, 'at')
    .replace(/\b(\d+)\/(\d+)\/(\d+)\b/g, '$1 $2 $3') // Date formatting
    .replace(/\b(\d+):(\d+)\b/g, '$1 $2') // Time formatting
    .replace(/[^\w\s.,!?-]/g, ' ') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}
