import type { Page } from '@playwright/test';
import type { TokenPair } from './apiMock';

// Mirrors src/features/auth/auth.constants.ts — the e2e suite must not import app code.
const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';
// A path outside every route group: the 404 page carries no guard, so seeding cannot race a session load.
const BLANK_PATH = '/e2e-blank';

/** Writes a token pair into the app origin's localStorage, as a previous sign-in would have. */
export const seedSession = async (page: Page, pair: TokenPair) => {
  await page.goto(BLANK_PATH);
  await page.evaluate(
    ([accessKey, refreshKey, tokens]) => {
      window.localStorage.setItem(accessKey, tokens.accessToken);
      window.localStorage.setItem(refreshKey, tokens.refreshToken);
    },
    [ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY, pair] as const,
  );
};

export const readStoredTokens = (page: Page) =>
  page.evaluate(
    ([accessKey, refreshKey]) => ({
      accessToken: window.localStorage.getItem(accessKey),
      refreshToken: window.localStorage.getItem(refreshKey),
    }),
    [ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY] as const,
  );
