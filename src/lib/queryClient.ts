import { isServer, QueryClient } from '@tanstack/react-query';
import { ApiError } from './apiClient';

const STALE_TIME_MS = 30_000;
const MAX_RETRIES = 2;
const SERVER_ERROR_MIN = 500;

/** Retry only what can succeed on its own — network failures and 5xx. A 4xx answer will not change. */
const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (error instanceof ApiError && error.status < SERVER_ERROR_MIN) {
    return false;
  }
  return failureCount < MAX_RETRIES;
};

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: STALE_TIME_MS, retry: shouldRetry, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });

let browserQueryClient: QueryClient | undefined;

/**
 * On the server every call gets a fresh client, so no cache is ever shared between requests.
 * In the browser there is exactly one client, reachable outside React too — the auth store
 * clears it on sign-out so no user-scoped data survives into the next session.
 */
export const getQueryClient = (): QueryClient => {
  if (isServer) {
    return createQueryClient();
  }
  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
};
