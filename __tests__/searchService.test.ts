import { SearchService } from '../src/lib/searchService';

describe('SearchService', () => {
  it('should have performGlobalSearch method', () => {
    expect(typeof SearchService.performGlobalSearch).toBe('function');
  });
});
