import { expect, test } from '@playwright/test';
import { CREDENTIALS, ENDPOINTS, mockApi } from './apiMock';
import { readStoredTokens, seedSession } from './session';

const ROUTES = { ACCOUNT: '/account', LOGIN: '/login' } as const;
const NEW_PASSWORD = 'NewSecret123';
const TOKENS = { accessToken: 'access-0', refreshToken: 'refresh-0' };

const fillForm = async (page: import('@playwright/test').Page, currentPassword: string) => {
  await page.getByLabel('Current password').fill(currentPassword);
  await page.getByLabel('New password', { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel('Confirm new password').fill(NEW_PASSWORD);
  await page.getByRole('button', { name: 'Change password' }).click();
};

test.describe('change password', () => {
  test('swaps the session for the new one so the visitor stays signed in', async ({ page }) => {
    const api = mockApi(page, { validAccessTokens: [TOKENS.accessToken] });
    await api.ready;
    await seedSession(page, TOKENS);

    await page.goto(ROUTES.ACCOUNT);
    await fillForm(page, CREDENTIALS.password);

    await expect(page.getByText('Password changed')).toBeVisible();
    // The old pair was revoked by the change; the stored one is the replacement.
    expect(await readStoredTokens(page)).toEqual({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    expect(api.callsTo(ENDPOINTS.CHANGE_PASSWORD)[0]?.body).toEqual({
      currentPassword: CREDENTIALS.password,
      newPassword: NEW_PASSWORD,
    });

    // A guarded page still loads, which it could not with the revoked token.
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible();
  });

  test('reports a wrong current password on the field and keeps the session', async ({ page }) => {
    const api = mockApi(page, { validAccessTokens: [TOKENS.accessToken] });
    await api.ready;
    await seedSession(page, TOKENS);

    await page.goto(ROUTES.ACCOUNT);
    await fillForm(page, 'NotMyPassword1');

    await expect(page.getByText('Current password is incorrect')).toBeVisible();
    expect(await readStoredTokens(page)).toEqual(TOKENS);
    await expect(page).toHaveURL(ROUTES.ACCOUNT);
  });

  test('is behind the session guard like every other app page', async ({ page }) => {
    const api = mockApi(page);
    await api.ready;

    await page.goto(ROUTES.ACCOUNT);

    await expect(page).toHaveURL(`${ROUTES.LOGIN}?next=${encodeURIComponent(ROUTES.ACCOUNT)}`);
  });
});
