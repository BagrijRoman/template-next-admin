import { describe, expect, it } from 'vitest';
import { ApiError, ERROR_CODES, isApiError } from './apiError';

const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_TOO_MANY = 429;
const HTTP_BAD_GATEWAY = 502;

describe('ApiError', () => {
  it('exposes code, per-field details and meta from the backend body', () => {
    const error = new ApiError(
      HTTP_BAD_REQUEST,
      {
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'Validation failed',
        details: [
          { field: 'email', rule: 'isEmail', message: 'bad email' },
          { field: 'email', rule: 'maxLength', message: 'too long' },
          { field: 'password', rule: 'isNotEmpty', message: 'required' },
        ],
        meta: { retryAfterSeconds: 30 },
      },
      'Bad Request',
    );

    expect(error.code).toBe(ERROR_CODES.VALIDATION_FAILED);
    expect(error.isValidation).toBe(true);
    expect(error.is(ERROR_CODES.VALIDATION_FAILED)).toBe(true);
    expect(error.fieldErrors).toEqual({ email: 'bad email', password: 'required' });
    expect(error.retryAfterSeconds).toBe(30);
    expect(isApiError(error)).toBe(true);
  });

  it('flags 401 and 429 by status', () => {
    expect(new ApiError(HTTP_UNAUTHORIZED, { code: 'UNAUTHENTICATED' }, 'x').isUnauthenticated).toBe(true);
    expect(new ApiError(HTTP_TOO_MANY, { code: 'RATE_LIMITED' }, 'x').isRateLimited).toBe(true);
    expect(new ApiError(HTTP_TOO_MANY, { code: 'RATE_LIMITED' }, 'x').retryAfterSeconds).toBeUndefined();
  });

  it('degrades gracefully when the body is not the contract (proxy HTML, empty, garbage)', () => {
    const html = new ApiError(HTTP_BAD_GATEWAY, '<html>Bad gateway</html>', 'Bad Gateway');
    expect(html.code).toBe(ERROR_CODES.INTERNAL_ERROR);
    expect(html.message).toBe('Bad Gateway');
    expect(html.details).toEqual([]);
    expect(html.meta).toEqual({});

    const garbage = new ApiError(HTTP_BAD_REQUEST, { details: ['not', 'objects'], meta: 'nope', code: 7 }, 'fallback');
    expect(garbage.details).toEqual([]);
    expect(garbage.meta).toEqual({});
    expect(garbage.code).toBe(ERROR_CODES.INTERNAL_ERROR);
  });
});
