import { HTTP_STATUS } from './constants';

/**
 * Mirror of the backend's `ErrorCode` enum (`template-backend/src/common/errors/errorCode.ts`).
 * Keep the two in sync: a code is the only thing the client is allowed to branch on.
 */
export const ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  WRONG_CURRENT_PASSWORD: 'WRONG_CURRENT_PASSWORD',
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
  INVALID_VERIFICATION_TOKEN: 'INVALID_VERIFICATION_TOKEN',
  EMAIL_ALREADY_VERIFIED: 'EMAIL_ALREADY_VERIFIED',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  BREACHED_PASSWORD: 'BREACHED_PASSWORD',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/** One failed rule on one input field — validation errors and field-bound business errors alike. */
export type FieldError = { field: string; rule: string; message: string };

/** The backend's `ErrorResponseDto`; every field is optional here because a proxy or a crash may answer with anything. */
export type ErrorResponseBody = {
  statusCode?: number;
  error?: string;
  code?: string;
  message?: string;
  details?: FieldError[];
  meta?: Record<string, unknown>;
  timestamp?: string;
  path?: string;
};

const UNKNOWN_CODE: ErrorCode = ERROR_CODES.INTERNAL_ERROR;

const isFieldError = (value: unknown): value is FieldError =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as FieldError).field === 'string' &&
  typeof (value as FieldError).message === 'string';

const parseBody = (body: unknown): ErrorResponseBody =>
  typeof body === 'object' && body !== null ? (body as ErrorResponseBody) : {};

/**
 * Every non-2xx answer, parsed once: the stable `code` to branch on, per-field `details` ready to
 * land on a form, and `meta` (e.g. `retryAfterSeconds` on 429). Unknown or malformed bodies degrade
 * to `INTERNAL_ERROR` with the status text — the client never crashes on a bad error.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode | string;
  readonly details: FieldError[];
  readonly meta: Record<string, unknown>;
  readonly body: unknown;

  constructor(status: number, body: unknown, fallbackMessage: string) {
    const parsed = parseBody(body);
    super(parsed.message ?? fallbackMessage);
    this.name = 'ApiError';
    this.status = status;
    this.code = typeof parsed.code === 'string' ? parsed.code : UNKNOWN_CODE;
    this.details = Array.isArray(parsed.details) ? parsed.details.filter(isFieldError) : [];
    this.meta = typeof parsed.meta === 'object' && parsed.meta !== null ? parsed.meta : {};
    this.body = body;
  }

  /** First message per field — the shape a form needs. */
  get fieldErrors(): Record<string, string> {
    return this.details.reduce<Record<string, string>>((acc, { field, message }) => {
      acc[field] ??= message;
      return acc;
    }, {});
  }

  get isValidation(): boolean {
    return this.code === ERROR_CODES.VALIDATION_FAILED;
  }

  get isUnauthenticated(): boolean {
    return this.status === HTTP_STATUS.UNAUTHORIZED;
  }

  get isRateLimited(): boolean {
    return this.status === HTTP_STATUS.TOO_MANY_REQUESTS;
  }

  /** Seconds to wait before retrying, when the backend said so (every 429 does). */
  get retryAfterSeconds(): number | undefined {
    const value = this.meta.retryAfterSeconds;
    return typeof value === 'number' && value > 0 ? value : undefined;
  }

  is(code: ErrorCode): boolean {
    return this.code === code;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;
