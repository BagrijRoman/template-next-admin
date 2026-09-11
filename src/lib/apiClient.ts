import { AUTH_ENDPOINTS } from '@/features/auth/auth.constants';
import type { AuthResponse } from '@/features/auth/auth.types';
import { tokenStorage } from '@/features/auth/tokenStorage';
import { API_URL } from './constants';

const HTTP_UNAUTHORIZED = 401;
const HTTP_NO_CONTENT = 204;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

type RequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  body?: unknown;
  /** Skip the bearer header and the refresh-on-401 flow (sign-in, refresh, logout). */
  skipAuth?: boolean;
};

type ErrorBody = { message?: string; details?: string[] };

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type UnauthorizedHandler = () => void;
const unauthorizedHandlers = new Set<UnauthorizedHandler>();

/** Called when a request stays 401 after a refresh attempt — the session is gone. */
export const onUnauthorized = (handler: UnauthorizedHandler) => {
  unauthorizedHandlers.add(handler);
  return () => unauthorizedHandlers.delete(handler);
};

let refreshPromise: Promise<boolean> | null = null;

/** Single in-flight refresh shared by every concurrent 401 request. */
const refreshSession = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        return false;
      }
      const response = await fetch(`${API_URL}${AUTH_ENDPOINTS.REFRESH}`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) {
        return false;
      }
      tokenStorage.setTokens((await response.json()) as AuthResponse);
      return true;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

const parseBody = async (response: Response): Promise<unknown> => {
  if (response.status === HTTP_NO_CONTENT) {
    return undefined;
  }
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : undefined;
  } catch {
    return text;
  }
};

/** Backend errors carry `message`, and validation errors add a `details` list with one entry per failed field. */
const getErrorMessage = (body: unknown, fallback: string): string => {
  const { message, details } = (body as ErrorBody | undefined) ?? {};
  if (details?.length) {
    return details.join(', ');
  }
  return message ?? fallback;
};

const send = (method: string, path: string, { body, skipAuth, headers, ...init }: RequestOptions) => {
  const accessToken = skipAuth ? undefined : tokenStorage.getAccessToken();
  return fetch(`${API_URL}${path}`, {
    ...init,
    method,
    headers: {
      ...(body === undefined ? {} : JSON_HEADERS),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
};

const request = async <T>(method: string, path: string, options: RequestOptions = {}): Promise<T> => {
  let response = await send(method, path, options);

  if (response.status === HTTP_UNAUTHORIZED && !options.skipAuth) {
    const refreshed = await refreshSession();
    if (refreshed) {
      response = await send(method, path, options);
    }
    if (response.status === HTTP_UNAUTHORIZED) {
      tokenStorage.clear();
      unauthorizedHandlers.forEach((handler) => handler());
    }
  }

  const data = await parseBody(response);
  if (!response.ok) {
    throw new ApiError(response.status, getErrorMessage(data, response.statusText), data);
  }
  return data as T;
};

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
};
