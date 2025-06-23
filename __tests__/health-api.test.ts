import { GET } from '../src/app/api/health/route';
import { NextResponse } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.prototype.toISOString for consistent testing
    const mockDate = new Date('2025-06-24T10:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    jest.spyOn(mockDate, 'toISOString').mockReturnValue('2025-06-24T10:00:00.000Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return health status', async () => {
    const mockJson = jest.fn();
    (NextResponse.json as jest.Mock).mockReturnValue({ 
      json: mockJson 
    });

    await GET();

    expect(NextResponse.json).toHaveBeenCalledWith({
      status: 'ok',
      timestamp: '2025-06-24T10:00:00.000Z',
      message: 'HealthComm API is running'
    });
  });

  it('should return current timestamp', async () => {
    const mockJson = jest.fn();
    (NextResponse.json as jest.Mock).mockReturnValue({ 
      json: mockJson 
    });

    await GET();

    const [response] = (NextResponse.json as jest.Mock).mock.calls[0];
    expect(response.timestamp).toBe('2025-06-24T10:00:00.000Z');
    expect(response.status).toBe('ok');
    expect(response.message).toBe('HealthComm API is running');
  });
});
