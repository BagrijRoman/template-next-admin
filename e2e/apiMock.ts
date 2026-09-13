import type { BrowserContext, Page, Route } from '@playwright/test';

export const API_URL = 'http://localhost:3000';

export const ENDPOINTS = {
  SIGN_IN: '/auth/sign-in',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/users/me',
} as const;

export const CREDENTIALS = { email: 'admin@example.com', password: 'Password123!' };
export const USER = {
  id: 'u1',
  email: CREDENTIALS.email,
  firstName: 'Ada',
  lastName: 'Lovelace',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const HTTP = { OK: 200, NO_CONTENT: 204, UNAUTHORIZED: 401, NOT_FOUND: 404 } as const;
const errorBody = (status: number, code: string, message: string, extra: Record<string, unknown> = {}) => ({
  statusCode: status,
  error: 'Error',
  code,
  message,
  timestamp: new Date().toISOString(),
  ...extra,
});
const INVALID_CREDENTIALS = errorBody(HTTP.UNAUTHORIZED, 'INVALID_CREDENTIALS', 'Invalid credentials');
const UNAUTHORIZED = errorBody(HTTP.UNAUTHORIZED, 'UNAUTHENTICATED', 'Invalid or missing access token');

export type ApiCall = { method: string; path: string; authorization?: string; body?: unknown };
export type TokenPair = { accessToken: string; refreshToken: string };

type MockOptions = {
  /** Access tokens `GET /users/me` accepts before any refresh happened. */
  validAccessTokens?: string[];
  /** Refresh tokens `POST /auth/refresh` will redeem (each exactly once — they rotate). */
  validRefreshTokens?: string[];
  /** Slows the refresh reply down so parallel tabs really contend for the lock. */
  refreshDelayMs?: number;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A tiny in-browser fake of the auth backend: sign-in checks credentials, /users/me checks the
 * bearer, refresh rotates single-use tokens exactly like the real API, logout revokes. Every call
 * is recorded so tests can assert on how the client talked to the server.
 */
export const mockApi = (target: Page | BrowserContext, options: MockOptions = {}) => {
  const calls: ApiCall[] = [];
  const validAccessTokens = new Set(options.validAccessTokens ?? []);
  const validRefreshTokens = new Set(options.validRefreshTokens ?? []);
  let issued = 0;

  const issuePair = (): TokenPair => {
    issued += 1;
    const pair = { accessToken: `access-${issued}`, refreshToken: `refresh-${issued}` };
    validAccessTokens.add(pair.accessToken);
    validRefreshTokens.add(pair.refreshToken);
    return pair;
  };

  const json = (route: Route, status: number, body?: unknown) =>
    route.fulfill({ status, contentType: 'application/json', body: body === undefined ? '' : JSON.stringify(body) });

  const handle = async (route: Route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    const body = request.postDataJSON() as Record<string, string> | null;
    const authorization = (await request.headerValue('authorization')) ?? undefined;
    calls.push({ method, path, authorization, body: body ?? undefined });

    if (method === 'OPTIONS') {
      return route.fulfill({
        status: HTTP.NO_CONTENT,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': 'authorization, content-type',
          'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        },
      });
    }

    if (path === ENDPOINTS.SIGN_IN && method === 'POST') {
      if (body?.email === CREDENTIALS.email && body?.password === CREDENTIALS.password) {
        return json(route, HTTP.OK, { ...issuePair(), user: USER });
      }
      return json(route, HTTP.UNAUTHORIZED, INVALID_CREDENTIALS);
    }

    if (path === ENDPOINTS.ME && method === 'GET') {
      const token = authorization?.replace(/^Bearer /, '');
      return token && validAccessTokens.has(token)
        ? json(route, HTTP.OK, USER)
        : json(route, HTTP.UNAUTHORIZED, UNAUTHORIZED);
    }

    if (path === ENDPOINTS.REFRESH && method === 'POST') {
      if (options.refreshDelayMs) {
        await wait(options.refreshDelayMs);
      }
      const refreshToken = body?.refreshToken;
      if (refreshToken && validRefreshTokens.has(refreshToken)) {
        validRefreshTokens.delete(refreshToken);
        return json(route, HTTP.OK, { ...issuePair(), user: USER });
      }
      return json(route, HTTP.UNAUTHORIZED, UNAUTHORIZED);
    }

    if (path === ENDPOINTS.LOGOUT && method === 'POST') {
      if (body?.refreshToken) {
        validRefreshTokens.delete(body.refreshToken);
      }
      return json(route, HTTP.NO_CONTENT);
    }

    return json(route, HTTP.NOT_FOUND, errorBody(HTTP.NOT_FOUND, 'NOT_FOUND', `Unhandled ${method} ${path}`));
  };

  const ready = target.route(`${API_URL}/**`, async (route) => {
    const response = await handle(route);
    return response;
  });

  return {
    ready,
    calls,
    callsTo: (path: string) => calls.filter((call) => call.path === path),
  };
};
