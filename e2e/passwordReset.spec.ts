import { expect, test } from '@playwright/test';
import { CREDENTIALS, ENDPOINTS, mockApi, VALID_RESET_TOKEN } from './apiMock';

const ROUTES = { LOGIN: '/login', FORGOT_PASSWORD: '/forgot-password', RESET_PASSWORD: '/reset-password' } as const;
const NEW_PASSWORD = 'NewSecret123';

const setNewPassword = async (page: import('@playwright/test').Page) => {
  await page.getByLabel('New password', { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel('Confirm new password').fill(NEW_PASSWORD);
  await page.getByRole('button', { name: 'Set new password' }).click();
};

test.describe('password reset', () => {
  test('a visitor requests a link from the login page and gets a neutral answer', async ({ page }) => {
    const api = mockApi(page);
    await api.ready;

    await page.goto(ROUTES.LOGIN);
    await page.getByRole('link', { name: 'Forgot your password?' }).click();

    await expect(page).toHaveURL(ROUTES.FORGOT_PASSWORD);
    await page.getByLabel('Email').fill(CREDENTIALS.email);
    await page.getByRole('button', { name: 'Send reset link' }).click();

    await expect(page.getByText(/if that address belongs to an account/i)).toBeVisible();
    expect(api.callsTo(ENDPOINTS.FORGOT_PASSWORD)[0]?.body).toEqual({ email: CREDENTIALS.email });
  });

  test('a valid link sets the password and sends the visitor back to sign in', async ({ page }) => {
    const api = mockApi(page);
    await api.ready;

    await page.goto(`${ROUTES.RESET_PASSWORD}?token=${VALID_RESET_TOKEN}`);
    await setNewPassword(page);

    await expect(page).toHaveURL(ROUTES.LOGIN);
    await expect(page.getByText('Password updated')).toBeVisible();
    expect(api.callsTo(ENDPOINTS.RESET_PASSWORD)[0]?.body).toEqual({
      token: VALID_RESET_TOKEN,
      newPassword: NEW_PASSWORD,
    });
  });

  test('a spent link keeps the visitor on the page with the backend reason', async ({ page }) => {
    const api = mockApi(page);
    await api.ready;

    await page.goto(`${ROUTES.RESET_PASSWORD}?token=already-used`);
    await setNewPassword(page);

    await expect(page.getByText('This reset link has expired')).toBeVisible();
    await expect(page).toHaveURL(/reset-password/);
  });

  test('a link with no token offers a fresh one instead of a form', async ({ page }) => {
    const api = mockApi(page);
    await api.ready;

    await page.goto(ROUTES.RESET_PASSWORD);

    await expect(page.getByLabel('New password', { exact: true })).toBeHidden();
    await page.getByRole('link', { name: 'Request a new link' }).click();
    await expect(page).toHaveURL(ROUTES.FORGOT_PASSWORD);
  });
});
