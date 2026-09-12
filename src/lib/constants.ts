export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  DESIGN_SYSTEM: '/design-system',
} as const;

/** Query param carrying the path to return to after signing in. */
export const NEXT_PARAM = 'next';

export const HTTP_STATUS = {
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
} as const;
