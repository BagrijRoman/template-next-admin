import { expect, test } from '@playwright/test';
import { CREDENTIALS, ENDPOINTS, mockApi, USERS_TOTAL } from './apiMock';
import { seedSession } from './session';

const ROUTES = { LOGIN: '/login', USERS: '/users' } as const;
const SECOND_PAGE = `${ROUTES.USERS}?page=2`;
const TOKENS = { accessToken: 'access-0', refreshToken: 'refresh-0' };

test.describe('users list', () => {
  test('an admin pages through the accounts, with the page kept in the URL', async ({ page }) => {
    const api = mockApi(page, { validAccessTokens: [TOKENS.accessToken] });
    await api.ready;
    await seedSession(page, TOKENS);

    await page.goto(ROUTES.USERS);

    await expect(page.getByRole('cell', { name: 'user1@example.com' })).toBeVisible();
    await expect(page.getByText(`1–20 of ${USERS_TOTAL}`)).toBeVisible();

    await page.getByRole('button', { name: 'Next', exact: true }).click();

    await expect(page).toHaveURL(SECOND_PAGE);
    await expect(page.getByRole('cell', { name: 'user21@example.com' })).toBeVisible();
    await expect(page.getByText(`21–40 of ${USERS_TOTAL}`)).toBeVisible();
    expect(api.callsTo(ENDPOINTS.USERS).map((call) => call.query)).toEqual([
      '?limit=20&offset=0',
      '?limit=20&offset=20',
    ]);
  });

  test('a linked page loads directly, without stepping through the first one', async ({ page }) => {
    const api = mockApi(page, { validAccessTokens: [TOKENS.accessToken] });
    await api.ready;
    await seedSession(page, TOKENS);

    await page.goto(SECOND_PAGE);

    await expect(page.getByRole('cell', { name: 'user21@example.com' })).toBeVisible();
    expect(api.callsTo(ENDPOINTS.USERS)).toHaveLength(1);
  });

  test('a signed-in visitor without the admin role is told why the table is empty', async ({ page }) => {
    const api = mockApi(page, { validAccessTokens: [TOKENS.accessToken], role: 'user' });
    await api.ready;
    await seedSession(page, TOKENS);

    await page.goto(ROUTES.USERS);

    await expect(page.getByText('You do not have permission to do this.')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Pagination' })).toBeHidden();
  });

  test('a guest is sent to sign in and lands back on the page they asked for', async ({ page }) => {
    const api = mockApi(page);
    await api.ready;

    await page.goto(SECOND_PAGE);

    await expect(page).toHaveURL(`${ROUTES.LOGIN}?next=${encodeURIComponent(SECOND_PAGE)}`);
    await page.getByLabel('Email').fill(CREDENTIALS.email);
    await page.getByLabel('Password').fill(CREDENTIALS.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(SECOND_PAGE);
    await expect(page.getByRole('cell', { name: 'user21@example.com' })).toBeVisible();
  });
});
