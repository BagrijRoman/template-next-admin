import { ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from './auth.constants';
import type { TokenPair } from './auth.types';

const MS_IN_SECOND = 1000;
const JWT_PAYLOAD_INDEX = 1;

// Classic bearer storage: both tokens live in localStorage. It is shared across tabs (the
// cross-tab refresh lock's re-check relies on that) but invisible to the server, so all route
// guarding is client-side. localStorage can throw (SSR, blocked site data) — auth must degrade
// to "signed out", never crash.
const read = (key: string): string | undefined => {
  try {
    return window.localStorage.getItem(key) ?? undefined;
  } catch {
    return undefined;
  }
};

const write = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the session simply won't survive a reload.
  }
};

const remove = (key: string): void => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to clean when storage is unavailable.
  }
};

/**
 * localStorage entries never expire on their own — unlike the cookies this replaced — so a
 * long-dead token would keep reading as "there is a session" and send guards bouncing between
 * pages. Reading `exp` is a UX shortcut only: the backend remains the authority on validity.
 */
const isExpired = (token: string): boolean => {
  try {
    const payload = token.split('.')[JWT_PAYLOAD_INDEX];
    const { exp } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
    return exp !== undefined && exp * MS_IN_SECOND <= Date.now();
  } catch {
    // Unparseable token: let the backend reject it rather than guessing here.
    return false;
  }
};

const readUsableToken = (key: string): string | undefined => {
  const token = read(key);
  return token && !isExpired(token) ? token : undefined;
};

export const tokenStorage = {
  getAccessToken: () => readUsableToken(ACCESS_TOKEN_STORAGE_KEY),
  getRefreshToken: () => readUsableToken(REFRESH_TOKEN_STORAGE_KEY),
  setTokens: ({ accessToken, refreshToken }: TokenPair) => {
    write(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    write(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  },
  clear: () => {
    remove(ACCESS_TOKEN_STORAGE_KEY);
    remove(REFRESH_TOKEN_STORAGE_KEY);
  },
};
