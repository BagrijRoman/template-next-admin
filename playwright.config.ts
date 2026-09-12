import { defineConfig, devices } from '@playwright/test';
import { API_URL } from './e2e/apiMock';

// Own port, never reused: a foreign dev server on the app's port must not be picked up by mistake.
const E2E_PORT = 3101;
const BASE_URL = `http://localhost:${E2E_PORT}`;
const SERVER_START_TIMEOUT_MS = 120_000;
// The dev server compiles pages on first hit; parallel workers can push a first render past the default 5s.
const EXPECT_TIMEOUT_MS = 10_000;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  expect: { timeout: EXPECT_TIMEOUT_MS },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx next dev -p ${E2E_PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: SERVER_START_TIMEOUT_MS,
    // The e2e suite mocks the API at this origin, whatever .env.local says.
    env: { NEXT_PUBLIC_API_URL: API_URL },
  },
});
