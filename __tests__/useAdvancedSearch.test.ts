import { renderHook, act } from '@testing-library/react';
import { useAdvancedSearch } from '../src/hooks/useAdvancedSearch';
import { FilterConfig } from '../src/types/search';

describe('useAdvancedSearch', () => {
  it('should initialize with empty filters and presets', () => {
    const { result } = renderHook(() => useAdvancedSearch());
    expect(result.current.filters).toEqual({});
    expect(Array.isArray(result.current.savedPresets)).toBe(true);
  });

  it('should update filters', () => {
    const { result } = renderHook(() => useAdvancedSearch());
    const newFilters: FilterConfig = {};
    act(() => {
      result.current.updateFilters(newFilters);
    });
    expect(result.current.filters).toEqual(newFilters);
  });
});
