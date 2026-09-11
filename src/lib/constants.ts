export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
} as const;

/** Routes that only signed-out visitors may open; everything else is part of the app and requires a session. */
export const AUTH_ROUTES: readonly string[] = [ROUTES.LOGIN];

/** Query param carrying the path to return to after signing in. */
export const NEXT_PARAM = 'next';
