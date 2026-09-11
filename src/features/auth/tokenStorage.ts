import Cookies from 'js-cookie';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './auth.constants';
import type { TokenPair } from './auth.types';

const MS_IN_SECOND = 1000;
const JWT_PAYLOAD_INDEX = 1;

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

/** Cookie lifetime mirrors the token's own `exp`, so the backend TTLs stay the single source of truth. */
const getJwtExpiry = (token: string): Date | undefined => {
  try {
    const payload = token.split('.')[JWT_PAYLOAD_INDEX];
    const { exp } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
    return exp ? new Date(exp * MS_IN_SECOND) : undefined;
  } catch {
    return undefined;
  }
};

export const tokenStorage = {
  getAccessToken: () => Cookies.get(ACCESS_TOKEN_COOKIE),
  getRefreshToken: () => Cookies.get(REFRESH_TOKEN_COOKIE),
  setTokens: ({ accessToken, refreshToken }: TokenPair) => {
    Cookies.set(ACCESS_TOKEN_COOKIE, accessToken, { ...COOKIE_OPTIONS, expires: getJwtExpiry(accessToken) });
    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, { ...COOKIE_OPTIONS, expires: getJwtExpiry(refreshToken) });
  },
  clear: () => {
    Cookies.remove(ACCESS_TOKEN_COOKIE, COOKIE_OPTIONS);
    Cookies.remove(REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS);
  },
};
