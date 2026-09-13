import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { AUTH_ENDPOINTS } from '@/features/auth/auth.constants';
import type { AuthResponse } from '@/features/auth/auth.types';
import { tokenStorage } from '@/features/auth/tokenStorage';
import { ApiError } from './apiError';
import { API_URL, HTTP_STATUS } from './constants';

export { ApiError, isApiError } from './apiError';
export type { ErrorCode, ErrorResponseBody, FieldError } from './apiError';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Skip the bearer header and the refresh-on-401 flow (sign-in, refresh, logout). */
    skipAuth?: boolean;
    /** Set by the response interceptor on the single post-refresh retry, so a second 401 is final. */
    retriedAfterRefresh?: boolean;
  }
}

type RequestOptions = Omit<AxiosRequestConfig, 'url' | 'method' | 'data' | 'baseURL' | 'retriedAfterRefresh'>;

type UnauthorizedHandler = () => void;
const unauthorizedHandlers = new Set<UnauthorizedHandler>();

/** Called when a request stays 401 after a refresh attempt — the session is gone. */
export const onUnauthorized = (handler: UnauthorizedHandler) => {
  unauthorizedHandlers.add(handler);
  return () => unauthorizedHandlers.delete(handler);
};

// Cross-tab mutex name for the Web Locks API; the lock is origin-scoped and browser-managed,
// so it auto-releases when a tab holding it crashes — unlike hand-rolled lock flags.
const REFRESH_LOCK = 'auth-refresh';

const performRefresh = async (): Promise<boolean> => {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return false;
  }
  try {
    // Bare axios call: the instance's interceptors must not run for the refresh itself.
    const { data } = await axios.post<AuthResponse>(`${API_URL}${AUTH_ENDPOINTS.REFRESH}`, { refreshToken });
    tokenStorage.setTokens(data);
    return true;
  } catch {
    return false;
  }
};

/**
 * Refresh tokens are single-use on the backend (a second redemption reads as theft and revokes
 * the whole session family), so two tabs must never refresh with the same token. The lock
 * serializes tabs; the re-check inside makes the waiting tab a no-op — the winner's fresh pair
 * is already in localStorage, which every tab of this origin shares.
 */
const refreshExclusively = async (staleRefreshToken: string): Promise<boolean> =>
  await navigator.locks.request(REFRESH_LOCK, async () => {
    const currentRefreshToken = tokenStorage.getRefreshToken();
    if (currentRefreshToken && currentRefreshToken !== staleRefreshToken) {
      return true;
    }
    return performRefresh();
  });

let refreshPromise: Promise<boolean> | null = null;

/** Single in-flight refresh per tab (and, via the Web Lock, per browser). */
const refreshSession = (): Promise<boolean> => {
  if (!refreshPromise) {
    const staleRefreshToken = tokenStorage.getRefreshToken();
    const canLock = typeof navigator !== 'undefined' && 'locks' in navigator;
    refreshPromise = (canLock && staleRefreshToken ? refreshExclusively(staleRefreshToken) : performRefresh()).finally(
      () => {
        refreshPromise = null;
      },
    );
  }
  return refreshPromise;
};

const httpClient = axios.create({ baseURL: API_URL });

/** Request interceptor: attach the bearer token unless the call opted out with `skipAuth`. */
const attachBearer = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const accessToken = config.skipAuth ? undefined : tokenStorage.getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
};

const dropSession = (): void => {
  tokenStorage.clear();
  unauthorizedHandlers.forEach((handler) => handler());
};

/**
 * Response interceptor: a 401 on an authenticated call triggers one shared refresh and a single
 * retry; a 401 that survives the retry (or a failed refresh) means the session is gone. Every
 * HTTP error is parsed into `ApiError` (code, field details, meta); network failures (no response)
 * are rethrown untouched so callers can tell a revoked session from an outage.
 */
const handleResponseError = async (error: AxiosError): Promise<unknown> => {
  const { config, response } = error;
  if (!response || !config) {
    throw error;
  }

  if (response.status === HTTP_STATUS.UNAUTHORIZED && !config.skipAuth) {
    if (!config.retriedAfterRefresh && (await refreshSession())) {
      return httpClient.request({ ...config, retriedAfterRefresh: true });
    }
    dropSession();
  }

  throw new ApiError(response.status, response.data, response.statusText);
};

httpClient.interceptors.request.use(attachBearer);
httpClient.interceptors.response.use((response) => response, handleResponseError);

const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const { data } = await httpClient.request<T>(config);
  return data;
};

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>({ ...options, method: 'GET', url: path }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>({ ...options, method: 'POST', url: path, data: body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>({ ...options, method: 'PATCH', url: path, data: body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>({ ...options, method: 'DELETE', url: path }),
};
