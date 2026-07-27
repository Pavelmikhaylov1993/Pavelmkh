import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

// Позволяет прогнать тот же набор против живого сайта после деплоя:
// PLAYWRIGHT_BASE_URL=https://nkonovalov1990.github.io/Pavelmkh/ npm run test:e2e
// В этом режиме локальный сервер не поднимается. Тесты бюджета читают локальный
// dist/, поэтому осмысленны только если он собран из той же ревизии.
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: externalBaseURL ?? `http://localhost:${PORT}/Pavelmkh/`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    // browserName обязателен: дескриптор iPhone 13 требует WebKit, а ставится только chromium.
    // viewport задаём явно: у дескриптора он 390×664, а 390×844 из спеки — это поле screen,
    // которое на вёрстку не влияет. Без этой строки тесты адаптива шли бы не на том размере.
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: `npm run build && npm run preview -- --port ${PORT}`,
        url: `http://localhost:${PORT}/Pavelmkh/`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
