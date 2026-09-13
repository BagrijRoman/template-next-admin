import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from '@/features/auth/auth.constants';
import { installAxiosMock } from '@/test/axiosMock';
import { makeJwt } from '@/test/jwt';
import { HTTP_STATUS } from './constants';

const SECOND = 1;
const HOUR_IN_SECONDS = 3600;
const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_SERVER_ERROR = 500;
const PATH = '/things';
const REFRESH_PATH = '/auth/refresh';

const storeTokens = (accessToken: string, refreshToken: string) => {
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
};

const newTokens = { accessToken: 'access-2', refreshToken: 'refresh-2', user: { id: 'u1' } };

/** Fresh module per test: `refreshPromise` and the unauthorized handlers are module state. */
const loadClient = async () => {
  vi.resetModules();
  return import('./apiClient');
};

/**
 * In-memory stand-in for the Web Locks API: callbacks queued under the same name run one after
 * another, exactly like two tabs contending for an origin-scoped lock.
 */
const installFakeLocks = () => {
  const queues = new Map<string, Promise<unknown>>();
  const locks = {
    request: (name: string, callback: () => Promise<unknown>) => {
      const previous = queues.get(name) ?? Promise.resolve();
      const next = previous.then(callback, callback);
      queues.set(name, next);
      return next;
    },
  };
  Object.defineProperty(navigator, 'locks', { value: locks, configurable: true });
};

describe('apiClient', () => {
  let mock: ReturnType<typeof installAxiosMock>;

  beforeEach(() => {
    mock = installAxiosMock();
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'locks');
  });

  it('attaches the stored bearer token and returns the response body', async () => {
    storeTokens('access-1', 'refresh-1');
    mock.reply(() => ({ status: HTTP_OK, data: { ok: true } }));
    const { apiClient } = await loadClient();

    await expect(apiClient.get(PATH)).resolves.toEqual({ ok: true });
    expect(mock.requests[0]).toMatchObject({ method: 'GET', authorization: 'Bearer access-1' });
    expect(mock.requests[0].url).toContain(PATH);
  });

  it('sends the JSON body and skips the bearer header with skipAuth', async () => {
    storeTokens('access-1', 'refresh-1');
    const { apiClient } = await loadClient();

    await apiClient.post(PATH, { name: 'x' }, { skipAuth: true });
    expect(mock.requests[0]).toMatchObject({ method: 'POST', body: { name: 'x' }, authorization: undefined });
  });

  it('does not attach an expired access token', async () => {
    storeTokens(makeJwt(-SECOND), 'refresh-1');
    mock.reply(() => ({ status: HTTP_OK }));
    const { apiClient } = await loadClient();

    await apiClient.get(PATH);
    expect(mock.requests[0].authorization).toBeUndefined();
  });

  it('refreshes once on 401 and retries with the new token', async () => {
    storeTokens('access-1', 'refresh-1');
    mock.reply((request) => {
      if (request.url.endsWith(REFRESH_PATH)) {
        return { status: HTTP_OK, data: newTokens };
      }
      return request.authorization === 'Bearer access-2'
        ? { status: HTTP_OK, data: { ok: true } }
        : { status: HTTP_STATUS.UNAUTHORIZED };
    });
    const { apiClient } = await loadClient();

    await expect(apiClient.get(PATH)).resolves.toEqual({ ok: true });
    expect(mock.callsTo(REFRESH_PATH)).toHaveLength(1);
    expect(mock.callsTo(REFRESH_PATH)[0]).toMatchObject({
      body: { refreshToken: 'refresh-1' },
      authorization: undefined,
    });
    expect(mock.callsTo(PATH).map((request) => request.authorization)).toEqual(['Bearer access-1', 'Bearer access-2']);
    expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)).toBe('refresh-2');
  });

  it('shares a single refresh between parallel requests in the same tab', async () => {
    storeTokens('access-1', 'refresh-1');
    mock.reply((request) => {
      if (request.url.endsWith(REFRESH_PATH)) {
        return { status: HTTP_OK, data: newTokens };
      }
      return request.authorization === 'Bearer access-2' ? { status: HTTP_OK } : { status: HTTP_STATUS.UNAUTHORIZED };
    });
    const { apiClient } = await loadClient();

    await Promise.all([apiClient.get(PATH), apiClient.get(PATH), apiClient.get(PATH)]);
    expect(mock.callsTo(REFRESH_PATH)).toHaveLength(1);
  });

  it('clears the session and notifies handlers when the retry is still 401', async () => {
    storeTokens('access-1', 'refresh-1');
    mock.reply((request) =>
      request.url.endsWith(REFRESH_PATH) ? { status: HTTP_OK, data: newTokens } : { status: HTTP_STATUS.UNAUTHORIZED },
    );
    const { apiClient, ApiError, onUnauthorized } = await loadClient();
    const handler = vi.fn();
    onUnauthorized(handler);

    await expect(apiClient.get(PATH)).rejects.toMatchObject({ status: HTTP_STATUS.UNAUTHORIZED });
    await expect(apiClient.get(PATH)).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalled();
    expect(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('clears the session when the refresh itself is rejected', async () => {
    storeTokens('access-1', 'refresh-1');
    mock.reply(() => ({ status: HTTP_STATUS.UNAUTHORIZED }));
    const { apiClient, onUnauthorized } = await loadClient();
    const handler = vi.fn();
    onUnauthorized(handler);

    await expect(apiClient.get(PATH)).rejects.toMatchObject({ status: HTTP_STATUS.UNAUTHORIZED });
    expect(mock.callsTo(REFRESH_PATH)).toHaveLength(1);
    expect(mock.callsTo(PATH)).toHaveLength(1);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('does not attempt a refresh without a usable refresh token', async () => {
    storeTokens('access-1', makeJwt(-SECOND));
    mock.reply(() => ({ status: HTTP_STATUS.UNAUTHORIZED }));
    const { apiClient } = await loadClient();

    await expect(apiClient.get(PATH)).rejects.toMatchObject({ status: HTTP_STATUS.UNAUTHORIZED });
    expect(mock.callsTo(REFRESH_PATH)).toHaveLength(0);
  });

  it('does not refresh or clear the session on a 401 from a skipAuth call', async () => {
    storeTokens('access-1', 'refresh-1');
    mock.reply(() => ({ status: HTTP_STATUS.UNAUTHORIZED, data: { message: 'Invalid credentials' } }));
    const { apiClient, onUnauthorized } = await loadClient();
    const handler = vi.fn();
    onUnauthorized(handler);

    await expect(apiClient.post(PATH, {}, { skipAuth: true })).rejects.toMatchObject({
      message: 'Invalid credentials',
    });
    expect(mock.callsTo(REFRESH_PATH)).toHaveLength(0);
    expect(handler).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)).toBe('refresh-1');
  });

  it('parses the backend error contract into ApiError', async () => {
    const body = {
      statusCode: HTTP_BAD_REQUEST,
      error: 'Bad Request',
      code: 'VALIDATION_FAILED',
      message: 'Validation failed',
      details: [{ field: 'email', rule: 'isEmail', message: 'email must be a valid email address' }],
      meta: { hint: 'x' },
    };
    mock.reply(() => ({ status: HTTP_BAD_REQUEST, data: body }));
    const { apiClient, ApiError } = await loadClient();

    const error = await apiClient.get(PATH).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: HTTP_BAD_REQUEST,
      code: 'VALIDATION_FAILED',
      message: 'Validation failed',
      details: body.details,
      meta: { hint: 'x' },
      body,
    });
  });

  it('falls back to the status text when the error body has no message', async () => {
    mock.reply(() => ({ status: HTTP_SERVER_ERROR }));
    const { apiClient } = await loadClient();

    await expect(apiClient.get(PATH)).rejects.toMatchObject({
      status: HTTP_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: String(HTTP_SERVER_ERROR),
    });
  });

  it('rethrows network failures untouched, so callers can tell them from a revoked session', async () => {
    storeTokens('access-1', 'refresh-1');
    mock.reply(() => 'network-error');
    const { apiClient, ApiError } = await loadClient();

    const error = await apiClient.get(PATH).catch((caught: unknown) => caught);
    expect(error).not.toBeInstanceOf(ApiError);
    expect(mock.callsTo(REFRESH_PATH)).toHaveLength(0);
    expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)).toBe('refresh-1');
  });

  it('lets a second tab reuse the first tab’s refreshed tokens instead of redeeming the same refresh token', async () => {
    installFakeLocks();
    storeTokens(makeJwt(-SECOND), 'refresh-1');
    mock.reply((request) => {
      if (request.url.endsWith(REFRESH_PATH)) {
        return { status: HTTP_OK, data: newTokens };
      }
      return request.authorization === 'Bearer access-2' ? { status: HTTP_OK } : { status: HTTP_STATUS.UNAUTHORIZED };
    });
    // Two module instances = two tabs: separate in-memory state, shared localStorage and lock.
    const tabA = await loadClient();
    const tabB = await loadClient();

    await Promise.all([tabA.apiClient.get(PATH), tabB.apiClient.get(PATH)]);

    expect(mock.callsTo(REFRESH_PATH)).toHaveLength(1);
    expect(mock.callsTo(PATH).filter((request) => request.authorization === 'Bearer access-2')).toHaveLength(2);
  });

  it('keeps the refresh going without the Web Locks API', async () => {
    storeTokens('access-1', makeJwt(HOUR_IN_SECONDS));
    mock.reply((request) => {
      if (request.url.endsWith(REFRESH_PATH)) {
        return { status: HTTP_OK, data: newTokens };
      }
      return request.authorization === 'Bearer access-2' ? { status: HTTP_OK } : { status: HTTP_STATUS.UNAUTHORIZED };
    });
    const { apiClient } = await loadClient();

    await expect(apiClient.get(PATH)).resolves.toBeUndefined();
    expect(mock.callsTo(REFRESH_PATH)).toHaveLength(1);
  });
});
