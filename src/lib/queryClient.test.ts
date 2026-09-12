import { describe, expect, it } from 'vitest';
import { ApiError } from './apiClient';
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
    expect(retryOf(new ApiError(HTTP_NOT_FOUND, 'Not found'), FIRST_FAILURE)).toBe(false);
  });

  it('retries network failures and 5xx a bounded number of times', () => {
    expect(retryOf(new TypeError('Failed to fetch'), FIRST_FAILURE)).toBe(true);
    expect(retryOf(new ApiError(HTTP_SERVER_ERROR, 'Boom'), FIRST_FAILURE)).toBe(true);
    expect(retryOf(new ApiError(HTTP_SERVER_ERROR, 'Boom'), EXHAUSTED)).toBe(false);
  });

  it('hands out one shared client in the browser', () => {
    expect(getQueryClient()).toBe(getQueryClient());
  });
});
