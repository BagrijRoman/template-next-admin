import { env } from './env';

export const API_URL = env.NEXT_PUBLIC_API_URL;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  DESIGN_SYSTEM: '/design-system',
} as const;

/** Page numbers are 1-based wherever they appear in a URL. */
export const FIRST_PAGE = 1;

/** Query param carrying the path to return to after signing in. */
export const NEXT_PARAM = 'next';

export const HTTP_STATUS = {
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
  TOO_MANY_REQUESTS: 429,
} as const;

/** Password-strength bounds, identical to the backend's IsStrongPassword decorator. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
