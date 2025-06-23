import { phoneNumberSchema, emailSchema, nameSchema } from '../src/lib/validation';

describe('validation', () => {
  it('validates phone number', () => {
    expect(() => phoneNumberSchema.parse('+12345678901')).not.toThrow();
    expect(() => phoneNumberSchema.parse('123')).toThrow();
  });

  it('validates email', () => {
    expect(() => emailSchema.parse('test@example.com')).not.toThrow();
    expect(() => emailSchema.parse('bad-email')).toThrow();
  });

  it('validates name', () => {
    expect(() => nameSchema.parse('John Doe')).not.toThrow();
    expect(() => nameSchema.parse('')).toThrow();
  });
});
