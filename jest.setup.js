import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock console to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = (...args) => {
    // Only filter string arguments that contain React warnings
    if (typeof args[0] === 'string' && 
        (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
         args[0].includes('Warning: An invalid form control') ||
         args[0].includes('Error: Not implemented: navigation'))) {
      return;
    }
    originalConsoleError(...args);
  };
  
  console.warn = (...args) => {
    // Filter common test warnings
    if (typeof args[0] === 'string' && 
        (args[0].includes('Twilio credentials not configured') ||
         args[0].includes('useLayoutEffect does nothing on the server'))) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

afterEach(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
