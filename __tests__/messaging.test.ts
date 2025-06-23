import { sendSMS } from '../src/lib/messaging';

describe('sendSMS', () => {
  it('should simulate sending SMS in demo mode', async () => {
    const result = await sendSMS('+12345678901', 'Hello!');
    expect(result).toHaveProperty('success');
    expect(['DELIVERED', 'FAILED']).toContain(result.status);
  });
});
