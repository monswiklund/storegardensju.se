import { defineConfig, devices } from '@playwright/test';

// reuseExistingServer means anything already listening on 5173 is treated as
// the app - including an unrelated container. Set PLAYWRIGHT_BASE_URL to point
// the suite at a server you started yourself (e.g. `vite preview` on a free
// port); the managed dev server is then skipped.
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalBaseURL || 'http://localhost:5173';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  ...(externalBaseURL
    ? {}
    : {
        webServer: {
          command: 'npm run dev:frontend',
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120 * 1000,
        },
      }),
});
