import { ApiError, ERROR_CODES, type ErrorCode } from './apiError';

export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
export const NETWORK_ERROR_MESSAGE = 'Cannot reach the server. Check your connection and try again.';

const SECONDS_PER_MINUTE = 60;

/**
 * Client-side wording for codes whose backend message is not what a user should read (too
 * technical, or the client knows more context). Anything not listed shows the backend message.
 */
const MESSAGE_BY_CODE: Partial<Record<ErrorCode, string>> = {
  [ERROR_CODES.VALIDATION_FAILED]: 'Some fields need attention.',
  [ERROR_CODES.UNAUTHENTICATED]: 'Your session has expired. Please sign in again.',
  [ERROR_CODES.FORBIDDEN]: 'You do not have permission to do this.',
  [ERROR_CODES.INTERNAL_ERROR]: GENERIC_ERROR_MESSAGE,
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable. Please try again shortly.',
};

const formatWait = (seconds: number): string => {
  if (seconds < SECONDS_PER_MINUTE) {
    return `${seconds} seconds`;
  }
  const minutes = Math.ceil(seconds / SECONDS_PER_MINUTE);
  return minutes === 1 ? '1 minute' : `${minutes} minutes`;
};

/** Axios (and fetch) network failures carry no response; everything else with a response is an ApiError already. */
const isNetworkError = (error: unknown): boolean =>
  error instanceof Error && !(error instanceof ApiError) && /network|fetch|timeout|aborted/i.test(error.message);

/**
 * The single place that turns any failure into text a user may read: a code-specific wording
 * when the client has one, the backend's message otherwise, a wait time for rate limits, and a
 * generic fallback for everything that is not an API answer.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.isRateLimited && error.retryAfterSeconds) {
      return `${error.message}. Try again in ${formatWait(error.retryAfterSeconds)}.`;
    }
    return MESSAGE_BY_CODE[error.code as ErrorCode] ?? error.message;
  }
  if (isNetworkError(error)) {
    return NETWORK_ERROR_MESSAGE;
  }
  return GENERIC_ERROR_MESSAGE;
};
