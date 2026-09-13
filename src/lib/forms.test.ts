import type { UseFormSetError } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { makeApiError } from '@/test/apiError';
import { GENERIC_ERROR_MESSAGE } from './errors';
import { applyFieldErrors } from './forms';

type Values = { email: string; password: string };

const HTTP_BAD_REQUEST = 400;
const HTTP_CONFLICT = 409;
const FIELDS = ['email', 'password'] as const;

describe('applyFieldErrors', () => {
  it('lands every known field error on the form and reports nothing else', () => {
    const setError = vi.fn<UseFormSetError<Values>>();
    const error = makeApiError({
      status: HTTP_BAD_REQUEST,
      code: 'VALIDATION_FAILED',
      message: 'Validation failed',
      details: [
        { field: 'email', rule: 'isEmail', message: 'bad email' },
        { field: 'password', rule: 'isNotEmpty', message: 'required' },
      ],
    });

    expect(applyFieldErrors<Values>(setError, error, FIELDS)).toBeNull();
    expect(setError).toHaveBeenCalledWith('email', { type: 'server:isEmail', message: 'bad email' });
    expect(setError).toHaveBeenCalledWith('password', { type: 'server:isNotEmpty', message: 'required' });
  });

  it('returns a form-level message when some details belong to fields the form does not have', () => {
    const setError = vi.fn<UseFormSetError<Values>>();
    const error = makeApiError({
      status: HTTP_BAD_REQUEST,
      code: 'VALIDATION_FAILED',
      message: 'Validation failed',
      details: [
        { field: 'email', rule: 'isEmail', message: 'bad email' },
        { field: 'captcha', rule: 'isNotEmpty', message: 'captcha required' },
      ],
    });

    expect(applyFieldErrors<Values>(setError, error, FIELDS)).toBe('Some fields need attention.');
    expect(setError).toHaveBeenCalledTimes(1);
  });

  it('keeps the backend message for a field-bound business error on an unknown field', () => {
    const setError = vi.fn<UseFormSetError<Values>>();
    const error = makeApiError({
      status: HTTP_CONFLICT,
      code: 'EMAIL_TAKEN',
      message: 'Email already exists',
      details: [{ field: 'newEmail', rule: 'unique', message: 'Email already exists' }],
    });

    expect(applyFieldErrors<Values>(setError, error, FIELDS)).toBe('Email already exists');
  });

  it('falls back to the generic message for non-API failures', () => {
    const setError = vi.fn<UseFormSetError<Values>>();

    expect(applyFieldErrors<Values>(setError, new Error('boom'), FIELDS)).toBe(GENERIC_ERROR_MESSAGE);
    expect(setError).not.toHaveBeenCalled();
  });
});
