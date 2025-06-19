import { useState, useCallback } from 'react';
import { z } from 'zod';

type ValidationResult<T> = {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
};

export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  const validate = useCallback((data: unknown): ValidationResult<T> => {
    try {
      const validatedData = schema.parse(data);
      setErrors({});
      setIsValid(true);
      return {
        isValid: true,
        errors: {},
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
        setIsValid(false);
        return {
          isValid: false,
          errors: fieldErrors,
        };
      }
      setErrors({ general: 'Validation failed' });
      setIsValid(false);
      return {
        isValid: false,
        errors: { general: 'Validation failed' },
      };
    }
  }, [schema]);

  const validateField = useCallback((field: string, value: unknown) => {
    try {
      // For single field validation, we'll validate the whole object
      // and only keep errors for the specific field
      const tempData = { [field]: value };
      schema.parse(tempData);
      
      // Clear error for this field
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => err.path.includes(field));
        if (fieldError) {
          setErrors(prev => ({
            ...prev,
            [field]: fieldError.message,
          }));
        }
      }
    }
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(false);
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    isValid,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
  };
}

// Specialized validation functions for common patterns
export const validators = {
  phoneNumber: (value: string): string | null => {
    if (!value) return 'Phone number is required';
    if (value.length < 10) return 'Phone number must be at least 10 digits';
    if (!/^\+?[\d\s\-\(\)]+$/.test(value)) return 'Invalid phone number format';
    return null;
  },

  email: (value: string): string | null => {
    if (!value) return null; // Optional field
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
    return null;
  },

  name: (value: string): string | null => {
    if (!value?.trim()) return 'Name is required';
    if (value.length > 50) return 'Name must be at most 50 characters';
    if (!/^[a-zA-Z\s\-'\.]+$/.test(value)) return 'Name contains invalid characters';
    return null;
  },

  required: (value: string): string | null => {
    if (!value?.trim()) return 'This field is required';
    return null;
  },

  maxLength: (max: number) => (value: string): string | null => {
    if (value && value.length > max) return `Must be at most ${max} characters`;
    return null;
  },

  minLength: (min: number) => (value: string): string | null => {
    if (value && value.length < min) return `Must be at least ${min} characters`;
    return null;
  },
};

// Form submission helper
export function useFormSubmission<T>(
  onSubmit: (data: T) => Promise<void>,
  schema: z.ZodSchema<T>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { validate } = useFormValidation(schema);

  const handleSubmit = useCallback(async (formData: unknown) => {
    const validation = validate(formData);
    
    if (!validation.isValid || !validation.data) {
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(validation.data);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      setSubmitError(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, validate]);

  return {
    handleSubmit,
    isSubmitting,
    submitError,
    clearSubmitError: () => setSubmitError(null),
  };
}
