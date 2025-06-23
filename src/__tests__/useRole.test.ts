import { useRole } from '../hooks/useRole';
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'admin' } })
}));
describe('useRole', () => {
  it('should be a function', () => {
    expect(typeof useRole).toBe('function');
  });
  it('should return isAdmin true for admin user', () => {
    const { isAdmin } = useRole();
    expect(isAdmin).toBe(true);
  });
});
