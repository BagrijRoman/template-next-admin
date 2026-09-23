import { expect, test } from '@playwright/test';

// Mirrors src/lib/constants.ts — the e2e suite must not import app code.
const LOGIN_PATH = '/login';
const MISSING_PATH = '/reports/2019';

test.describe('404 page', () => {
  test('renders for an unmatched path and names the path that is missing', async ({ page }) => {
    const response = await page.goto(MISSING_PATH);

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: 'This page went missing' })).toBeVisible();
    await expect(page.getByText(MISSING_PATH)).toBeVisible();
  });

  test('sends a signed-out visitor from "Go home" to the login page', async ({ page }) => {
    await page.goto(MISSING_PATH);
    await page.getByRole('link', { name: 'Go home' }).click();

    // / redirects to the dashboard, whose guard bounces a session-less visitor to /login.
    await expect(page).toHaveURL(new RegExp(`^.*${LOGIN_PATH}`));
  });
});
