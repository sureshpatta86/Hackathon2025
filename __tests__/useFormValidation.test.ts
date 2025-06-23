import { useFormValidation } from '../src/hooks/useFormValidation';
import { z } from 'zod';
import { renderHook, act } from '@testing-library/react';

describe('useFormValidation', () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.number().min(0)
  });

  it('validates correct data', () => {
    const { result } = renderHook(() => useFormValidation(schema));
    act(() => {
      const res = result.current.validate({ name: 'John', age: 30 });
      expect(res.isValid).toBe(true);
      expect(res.errors).toEqual({});
      expect(res.data).toEqual({ name: 'John', age: 30 });
    });
  });

  it('returns errors for invalid data', () => {
    const { result } = renderHook(() => useFormValidation(schema));
    act(() => {
      const res = result.current.validate({ name: '', age: -1 });
      expect(res.isValid).toBe(false);
      expect(res.errors).toHaveProperty('name');
      expect(res.errors).toHaveProperty('age');
    });
  });
});
