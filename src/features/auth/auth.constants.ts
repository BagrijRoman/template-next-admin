// Kept dependency-free: imported by proxy.ts, which runs in the edge runtime.
export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

export const AUTH_ENDPOINTS = {
  SIGN_IN: '/auth/sign-in',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/users/me',
} as const;
