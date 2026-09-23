import { expect, test } from '@playwright/test';

// Mirrors e2e/apiMock.ts — the API origin the dev server is pointed at for this suite.
const API_ORIGIN = 'http://localhost:3000';

test.describe('security headers', () => {
  test('every document is served with the hardening headers', async ({ page }) => {
    const response = await page.goto('/login');
    const headers = response?.headers() ?? {};

    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['cross-origin-opener-policy']).toBe('same-origin');
    expect(headers['strict-transport-security']).toContain('includeSubDomains');
    expect(headers['permissions-policy']).toContain('camera=()');
    // The framework and its version are never advertised.
    expect(headers['x-powered-by']).toBeUndefined();
  });

  test('the CSP locks the page down to itself and the API', async ({ page }) => {
    const response = await page.goto('/login');
    const csp = response?.headers()['content-security-policy'] ?? '';

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain(`connect-src 'self' ${API_ORIGIN}`);
  });
});
