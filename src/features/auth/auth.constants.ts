export const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';
export const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';

export const AUTH_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
} as const;

export const AUTH_ENDPOINTS = {
  SIGN_IN: '/auth/sign-in',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/users/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
} as const;

/** Query param carrying the single-use token from the password-reset email. */
export const RESET_TOKEN_PARAM = 'token';
