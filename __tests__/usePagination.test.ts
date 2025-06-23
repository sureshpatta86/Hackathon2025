import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../src/hooks/usePagination';

describe('usePagination', () => {
  it('should initialize with correct values', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100, itemsPerPage: 10, initialPage: 1 }));
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(10);
    expect(result.current.itemsPerPage).toBe(10);
  });

  it('should change page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100, itemsPerPage: 10, initialPage: 1 }));
    act(() => {
      result.current.setPage(2);
    });
    expect(result.current.currentPage).toBe(2);
  });
});
