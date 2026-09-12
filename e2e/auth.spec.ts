import { expect, test } from '@playwright/test';
import { CREDENTIALS, ENDPOINTS, mockApi, USER } from './apiMock';
import { makeJwt } from './jwt';
import { readStoredTokens, seedSession } from './session';

const EXPIRED_SECONDS = -60;
const REFRESH_DELAY_MS = 300;
const ROUTES = { LOGIN: '/login', DASHBOARD: '/dashboard', USERS: '/users' } as const;
const DEEP_LINK = `${ROUTES.USERS}?page=3`;
const DEEP_LINK_LOGIN_URL = `${ROUTES.LOGIN}?next=${encodeURIComponent(DEEP_LINK)}`;

const signIn = async (page: import('@playwright/test').Page, password = CREDENTIALS.password) => {
  await page.getByLabel('Email').fill(CREDENTIALS.email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
};

test.describe('sign-in', () => {
  test('signs in and lands on the dashboard with the session stored', async ({ page }) => {
    const api = mockApi(page);
    await api.ready;

    await page.goto(ROUTES.LOGIN);
    await signIn(page);

    await expect(page).toHaveURL(ROUTES.DASHBOARD);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText(USER.email)).toBeVisible();
    expect(await readStoredTokens(page)).toEqual({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    expect(api.callsTo(ENDPOINTS.SIGN_IN)[0]).toMatchObject({ body: CREDENTIALS, authorization: undefined });
  });

  test('shows the backend message for wrong credentials and stays on the page', async ({ page }) => {
    const api = mockApi(page);
    await api.ready;

    await page.goto(ROUTES.LOGIN);
    await signIn(page, 'wrong');

    // Next.js adds its own role="alert" route announcer, so match the form's alert by text.
    await expect(page.getByRole('alert').filter({ hasText: 'Invalid credentials' })).toBeVisible();
    await expect(page).toHaveURL(ROUTES.LOGIN);
    expect(api.callsTo(ENDPOINTS.REFRESH)).toHaveLength(0);
    expect(await readStoredTokens(page)).toEqual({ accessToken: null, refreshToken: null });
  });

  test('keeps a signed-in user off the login page', async ({ page }) => {
    const api = mockApi(page, { validAccessTokens: ['access-0'], validRefreshTokens: ['refresh-0'] });
    await api.ready;
    await seedSession(page, { accessToken: 'access-0', refreshToken: 'refresh-0' });

    await page.goto(ROUTES.LOGIN);

    await expect(page).toHaveURL(ROUTES.DASHBOARD);
  });
});

test.describe('deep links', () => {
  test('sends a guest to login and returns them to the exact URL after signing in', async ({ page }) => {
    const api = mockApi(page);
    await api.ready;

    await page.goto(DEEP_LINK);

    await expect(page).toHaveURL(DEEP_LINK_LOGIN_URL);
    await signIn(page);
    await expect(page).toHaveURL(DEEP_LINK);
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  });

  test('ignores an external next target', async ({ page }) => {
    const api = mockApi(page);
    await api.ready;

    await page.goto(`${ROUTES.LOGIN}?next=${encodeURIComponent('https://evil.example')}`);
    await signIn(page);

    await expect(page).toHaveURL(ROUTES.DASHBOARD);
  });
});

test.describe('session refresh', () => {
  test('restores a session whose access token expired by refreshing once', async ({ page }) => {
    const api = mockApi(page, { validRefreshTokens: ['refresh-0'] });
    await api.ready;
    await seedSession(page, { accessToken: makeJwt(EXPIRED_SECONDS), refreshToken: 'refresh-0' });

    await page.goto(ROUTES.DASHBOARD);

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    expect(api.callsTo(ENDPOINTS.REFRESH)).toHaveLength(1);
    expect(api.callsTo(ENDPOINTS.REFRESH)[0]).toMatchObject({ body: { refreshToken: 'refresh-0' } });
    expect(api.callsTo(ENDPOINTS.ME).map((call) => call.authorization)).toEqual([undefined, 'Bearer access-1']);
    expect(await readStoredTokens(page)).toEqual({ accessToken: 'access-1', refreshToken: 'refresh-1' });
  });

  test('redirects to login and clears storage when the session was revoked', async ({ page }) => {
    const api = mockApi(page);
    await api.ready;
    await seedSession(page, { accessToken: 'access-dead', refreshToken: 'refresh-dead' });

    await page.goto(ROUTES.DASHBOARD);

    await expect(page).toHaveURL(`${ROUTES.LOGIN}?next=${encodeURIComponent(ROUTES.DASHBOARD)}`);
    expect(api.callsTo(ENDPOINTS.REFRESH)).toHaveLength(1);
    expect(await readStoredTokens(page)).toEqual({ accessToken: null, refreshToken: null });
  });

  test('two tabs with an expired access token redeem the refresh token only once', async ({ context }) => {
    const api = mockApi(context, { validRefreshTokens: ['refresh-0'], refreshDelayMs: REFRESH_DELAY_MS });
    await api.ready;
    const tabA = await context.newPage();
    const tabB = await context.newPage();
    await seedSession(tabA, { accessToken: makeJwt(EXPIRED_SECONDS), refreshToken: 'refresh-0' });

    await Promise.all([tabA.goto(ROUTES.DASHBOARD), tabB.goto(ROUTES.USERS)]);

    await expect(tabA.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(tabB.getByRole('heading', { name: 'Users' })).toBeVisible();
    expect(api.callsTo(ENDPOINTS.REFRESH)).toHaveLength(1);
    expect(await readStoredTokens(tabB)).toEqual({ accessToken: 'access-1', refreshToken: 'refresh-1' });
  });
});

test.describe('sign-out', () => {
  test('revokes the refresh token, clears storage and returns to login', async ({ page }) => {
    const api = mockApi(page, { validAccessTokens: ['access-0'], validRefreshTokens: ['refresh-0'] });
    await api.ready;
    await seedSession(page, { accessToken: 'access-0', refreshToken: 'refresh-0' });
    await page.goto(ROUTES.DASHBOARD);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('button', { name: 'Sign out' }).click();

    await expect(page).toHaveURL(new RegExp(`^.*${ROUTES.LOGIN}`));
    expect(api.callsTo(ENDPOINTS.LOGOUT)[0]).toMatchObject({ body: { refreshToken: 'refresh-0' } });
    expect(await readStoredTokens(page)).toEqual({ accessToken: null, refreshToken: null });
  });
});
