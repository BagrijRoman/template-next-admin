import { isServer, MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/Toast';
import { ApiError } from './apiError';
import { getErrorMessage } from './errors';

declare module '@tanstack/react-query' {
  interface Register {
    /** `meta: { silent: true }` on a query or mutation keeps its failure off the toast channel. */
    queryMeta: { silent?: boolean };
    mutationMeta: { silent?: boolean };
  }
}

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

/**
 * Toasts are the default channel for failures: any query or mutation that does not opt out with
 * `meta.silent` reports its error here. A 401 is never toasted — `apiClient` and the auth store own
 * that flow and the user lands on the login page instead.
 */
export const reportError = (error: unknown, meta: { silent?: boolean } | undefined): void => {
  if (meta?.silent || (error instanceof ApiError && error.isUnauthenticated)) {
    return;
  }
  toast.error(getErrorMessage(error));
};

export const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({ onError: (error, query) => reportError(error, query.meta) }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => reportError(error, mutation.meta),
    }),
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
