import { MutationObserver } from '@tanstack/react-query';
import { beforeEach, describe, expect, it } from 'vitest';
import { useToastStore } from '@/components/ui/Toast';
import { makeApiError } from '@/test/apiError';
import { createQueryClient, getQueryClient } from './queryClient';

const HTTP_NOT_FOUND = 404;
const HTTP_SERVER_ERROR = 500;
const FIRST_FAILURE = 0;
const EXHAUSTED = 2;

const retryOf = (error: unknown, failureCount: number) => {
  const retry = createQueryClient().getDefaultOptions().queries?.retry;
  return typeof retry === 'function' ? retry(failureCount, error as Error) : retry;
};

describe('queryClient', () => {
  it('never retries a 4xx answer', () => {
    expect(retryOf(makeApiError({ status: HTTP_NOT_FOUND }), FIRST_FAILURE)).toBe(false);
  });

  it('retries network failures and 5xx a bounded number of times', () => {
    expect(retryOf(new TypeError('Failed to fetch'), FIRST_FAILURE)).toBe(true);
    expect(retryOf(makeApiError({ status: HTTP_SERVER_ERROR }), FIRST_FAILURE)).toBe(true);
    expect(retryOf(makeApiError({ status: HTTP_SERVER_ERROR }), EXHAUSTED)).toBe(false);
  });

  it('hands out one shared client in the browser', () => {
    expect(getQueryClient()).toBe(getQueryClient());
  });
});

describe('error reporting', () => {
  const HTTP_UNAUTHORIZED = 401;
  const HTTP_CONFLICT = 409;

  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('toasts a failed mutation by default', async () => {
    const client = createQueryClient();
    const mutation = new MutationObserver(client, {
      mutationFn: () => Promise.reject(makeApiError({ status: HTTP_CONFLICT, code: 'EMAIL_TAKEN', message: 'Taken' })),
    });

    await mutation.mutate().catch(() => undefined);

    expect(useToastStore.getState().toasts).toMatchObject([{ variant: 'error', title: 'Taken' }]);
  });

  it('stays quiet for silent mutations and for 401s', async () => {
    const client = createQueryClient();
    const silent = new MutationObserver(client, {
      mutationFn: () => Promise.reject(makeApiError({ status: HTTP_CONFLICT, code: 'EMAIL_TAKEN', message: 'Taken' })),
      meta: { silent: true },
    });
    const unauthenticated = new MutationObserver(client, {
      mutationFn: () => Promise.reject(makeApiError({ status: HTTP_UNAUTHORIZED, code: 'UNAUTHENTICATED' })),
    });

    await silent.mutate().catch(() => undefined);
    await unauthenticated.mutate().catch(() => undefined);

    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('toasts a failed query unless it is silent', async () => {
    const client = createQueryClient();

    await client
      .fetchQuery({ queryKey: ['loud'], queryFn: () => Promise.reject(new Error('boom')), retry: false })
      .catch(() => undefined);
    await client
      .fetchQuery({
        queryKey: ['quiet'],
        queryFn: () => Promise.reject(new Error('boom')),
        retry: false,
        meta: { silent: true },
      })
      .catch(() => undefined);

    expect(useToastStore.getState().toasts).toHaveLength(1);
  });
});
