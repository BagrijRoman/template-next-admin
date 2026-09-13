import { describe, expect, it } from 'vitest';
import { makeApiError } from '@/test/apiError';
import { GENERIC_ERROR_MESSAGE, getErrorMessage, NETWORK_ERROR_MESSAGE } from './errors';

const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_CONFLICT = 409;
const HTTP_TOO_MANY = 429;
const HTTP_SERVER_ERROR = 500;
const SECONDS = 45;
const FIFTEEN_MINUTES = 900;
const ONE_MINUTE = 60;

describe('getErrorMessage', () => {
  it('shows the backend message for codes the client has no wording for', () => {
    expect(getErrorMessage(makeApiError({ status: HTTP_CONFLICT, code: 'EMAIL_TAKEN', message: 'Taken' }))).toBe(
      'Taken',
    );
  });

  it('prefers the client wording for codes it knows better', () => {
    expect(
      getErrorMessage(
        makeApiError({ status: HTTP_BAD_REQUEST, code: 'VALIDATION_FAILED', message: 'Validation failed' }),
      ),
    ).toBe('Some fields need attention.');
    expect(getErrorMessage(makeApiError({ status: HTTP_UNAUTHORIZED, code: 'UNAUTHENTICATED' }))).toContain(
      'sign in again',
    );
    expect(
      getErrorMessage(
        makeApiError({ status: HTTP_SERVER_ERROR, code: 'INTERNAL_ERROR', message: 'Something went wrong' }),
      ),
    ).toBe(GENERIC_ERROR_MESSAGE);
  });

  it('appends the wait time to a rate-limited answer', () => {
    expect(
      getErrorMessage(
        makeApiError({
          status: HTTP_TOO_MANY,
          code: 'ACCOUNT_LOCKED',
          message: 'Locked',
          meta: { retryAfterSeconds: SECONDS },
        }),
      ),
    ).toBe('Locked. Try again in 45 seconds.');
    expect(
      getErrorMessage(
        makeApiError({
          status: HTTP_TOO_MANY,
          code: 'RATE_LIMITED',
          message: 'Slow down',
          meta: { retryAfterSeconds: ONE_MINUTE },
        }),
      ),
    ).toBe('Slow down. Try again in 1 minute.');
    expect(
      getErrorMessage(
        makeApiError({
          status: HTTP_TOO_MANY,
          code: 'ACCOUNT_LOCKED',
          message: 'Locked',
          meta: { retryAfterSeconds: FIFTEEN_MINUTES },
        }),
      ),
    ).toBe('Locked. Try again in 15 minutes.');
  });

  it('names a network failure and falls back to the generic text for anything else', () => {
    expect(getErrorMessage(new TypeError('Network Error'))).toBe(NETWORK_ERROR_MESSAGE);
    expect(getErrorMessage(new Error('boom'))).toBe(GENERIC_ERROR_MESSAGE);
    expect(getErrorMessage(undefined)).toBe(GENERIC_ERROR_MESSAGE);
  });
});
