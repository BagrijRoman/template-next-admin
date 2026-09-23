import { expect, test } from '@playwright/test';
import { ENDPOINTS, mockApi, VALID_VERIFICATION_TOKEN } from './apiMock';
import { seedSession } from './session';

const ROUTES = { DASHBOARD: '/dashboard', VERIFY_EMAIL: '/verify-email' } as const;
const TOKENS = { accessToken: 'access-0', refreshToken: 'refresh-0' };
const BANNER_TEXT = 'Your email address is not verified yet.';

test.describe('email verification', () => {
  test('an unverified account is nagged and can ask for a link', async ({ page }) => {
    const api = mockApi(page, { validAccessTokens: [TOKENS.accessToken], emailVerified: false });
    await api.ready;
    await seedSession(page, TOKENS);

    await page.goto(ROUTES.DASHBOARD);

    await expect(page.getByText(BANNER_TEXT)).toBeVisible();
    await page.getByRole('button', { name: 'Send verification link' }).click();

    await expect(page.getByText(/verification link sent/i)).toBeVisible();
    expect(api.callsTo(ENDPOINTS.SEND_VERIFICATION)).toHaveLength(1);
  });

  test('a verified account never sees the banner', async ({ page }) => {
    const api = mockApi(page, { validAccessTokens: [TOKENS.accessToken] });
    await api.ready;
    await seedSession(page, TOKENS);

    await page.goto(ROUTES.DASHBOARD);

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText(BANNER_TEXT)).toBeHidden();
  });

  test('the link verifies on a click and the banner is gone afterwards', async ({ page }) => {
    const api = mockApi(page, { validAccessTokens: [TOKENS.accessToken], emailVerified: false });
    await api.ready;
    await seedSession(page, TOKENS);

    await page.goto(`${ROUTES.VERIFY_EMAIL}?token=${VALID_VERIFICATION_TOKEN}`);

    // Opening the page must not spend the token: a mail scanner would do exactly that.
    expect(api.callsTo(ENDPOINTS.VERIFY_EMAIL)).toHaveLength(0);
    await page.getByRole('button', { name: 'Verify my email' }).click();
    await expect(page.getByText(/your email address is verified/i)).toBeVisible();

    await page.goto(ROUTES.DASHBOARD);
    await expect(page.getByText(BANNER_TEXT)).toBeHidden();
  });

  test('a spent link says what to do next and stays usable for a signed-out visitor', async ({ page }) => {
    const api = mockApi(page);
    await api.ready;

    await page.goto(`${ROUTES.VERIFY_EMAIL}?token=already-used`);
    await page.getByRole('button', { name: 'Verify my email' }).click();

    await expect(page.getByText(/this verification link has expired/i)).toBeVisible();
    // The page is outside every guard, so a signed-out visitor is never redirected away from it.
    await expect(page).toHaveURL(/verify-email/);
  });
});
