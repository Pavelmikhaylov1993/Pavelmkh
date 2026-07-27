import { expect, test } from '@playwright/test';

test('AC-28: главная собирается и отдаётся по base path', async ({ page }) => {
  const response = await page.goto('./');
  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
});
