import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const messagingMode = process.env.MESSAGING_MODE || 'demo';

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn('Twilio credentials not configured. Messages will be simulated.');
}

const client = accountSid && authToken && messagingMode === 'live' ? twilio(accountSid, authToken) : null;

export interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  status: 'DELIVERED' | 'FAILED' | 'PENDING';
}

export async function sendSMS(phoneNumber: string, message: string): Promise<MessageResult> {
  if (!client || !twilioPhoneNumber || messagingMode === 'demo') {
    console.log(`[${messagingMode.toUpperCase()} MODE] Simulating SMS send to:`, phoneNumber);
    console.log(`Message: ${message.substring(0, 100)}...`);
    // Simulate for demo
    return {
      success: Math.random() > 0.1, // 90% success rate
      messageId: 'demo_' + Math.random().toString(36).substr(2, 9),
      status: Math.random() > 0.1 ? 'DELIVERED' : 'FAILED',
      error: Math.random() > 0.1 ? undefined : 'Simulated delivery failure'
    };
  }

  try {
    console.log(`Sending real SMS to ${phoneNumber}: ${message.substring(0, 50)}...`);
    
    const twilioMessage = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber
    });

    console.log('SMS sent successfully:', twilioMessage.sid);
    
    return {
      success: true,
      messageId: twilioMessage.sid,
      status: 'DELIVERED'
    };
  } catch (error: unknown) {
    console.error('Failed to send SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'FAILED'
    };
  }
}

export async function makeVoiceCall(phoneNumber: string, message: string): Promise<MessageResult> {
  if (!client || !twilioPhoneNumber || messagingMode === 'demo') {
    console.log(`[${messagingMode.toUpperCase()} MODE] Simulating voice call to:`, phoneNumber);
    console.log(`Message: ${message.substring(0, 100)}...`);
    // Simulate for demo
    return {
      success: Math.random() > 0.1, // 90% success rate
      messageId: 'demo_' + Math.random().toString(36).substr(2, 9),
      status: Math.random() > 0.1 ? 'DELIVERED' : 'FAILED',
      error: Math.random() > 0.1 ? undefined : 'Simulated call failure'
    };
  }

  try {
    console.log(`Making real voice call to ${phoneNumber} with message: ${message.substring(0, 50)}...`);
    
    const call = await client.calls.create({
      twiml: `<Response><Say voice="alice">${message}</Say></Response>`,
      from: twilioPhoneNumber,
      to: phoneNumber
    });

    console.log('Voice call initiated:', call.sid);
    
    return {
      success: true,
      messageId: call.sid,
      status: 'DELIVERED'
    };
  } catch (error: unknown) {
    console.error('Failed to make voice call:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'FAILED'
    };
  }
}

export async function sendMessage(type: 'SMS' | 'VOICE', phoneNumber: string, message: string): Promise<MessageResult> {
  // Validate phone number format (basic validation)
  let formattedPhone = phoneNumber.trim();
  
  // If the phone number already starts with +, use it as is
  if (formattedPhone.startsWith('+')) {
    // Just validate that it has enough digits after the +
    const cleanPhone = formattedPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return {
        success: false,
        error: 'Invalid phone number format - too few digits',
        status: 'FAILED'
      };
    }
  } else {
    // If no country code, clean and add default (+1 for US)
    const cleanPhone = formattedPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return {
        success: false,
        error: 'Invalid phone number format - too few digits',
        status: 'FAILED'
      };
    }
    formattedPhone = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;
  }

  console.log(`Formatted phone number: ${formattedPhone}`);

  if (type === 'SMS') {
    return sendSMS(formattedPhone, message);
  } else if (type === 'VOICE') {
    return makeVoiceCall(formattedPhone, message);
  } else {
    return {
      success: false,
      error: 'Invalid message type',
      status: 'FAILED'
    };
  }
}
