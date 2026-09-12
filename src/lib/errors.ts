import { ApiError } from './apiClient';

export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

/** The message a user may see: the backend's own text for an API error, a generic one otherwise. */
export const getErrorMessage = (error: unknown): string =>
  error instanceof ApiError ? error.message : GENERIC_ERROR_MESSAGE;
