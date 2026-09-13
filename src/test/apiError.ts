import { ApiError, type ErrorCode, type FieldError } from '@/lib/apiError';

type ApiErrorInput = {
  status: number;
  code?: ErrorCode | string;
  message?: string;
  details?: FieldError[];
  meta?: Record<string, unknown>;
};

/** Builds an ApiError the way apiClient would from a backend error body. */
export const makeApiError = ({ status, code, message = 'Request failed', details, meta }: ApiErrorInput): ApiError =>
  new ApiError(status, { statusCode: status, code, message, details, meta }, String(status));
