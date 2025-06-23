import { validateToken } from '../src/lib/auth-utils';

describe('validateToken', () => {
  it('returns valid false for short token', () => {
    expect(validateToken('short')).toEqual({ valid: false });
  });
  it('returns valid true for correct token', () => {
    expect(validateToken('user1:admin:123456')).toEqual({ valid: true, userId: 'user1', role: 'admin' });
  });
  it('returns valid false for malformed token', () => {
    expect(validateToken('user1')).toEqual({ valid: false });
  });
});
