import { expect, test } from '@playwright/test';

test('AC-18: тема применяется инлайн-скриптом до стилей и до body', async ({ request }) => {
  const html = await (await request.get('./')).text();

  const scriptIndex = html.indexOf('prefers-color-scheme: dark');
  const stylesheetIndex = html.indexOf('<link rel="stylesheet"');
  const bodyIndex = html.indexOf('<body');

  expect(scriptIndex, 'инлайн-скрипт темы отсутствует в HTML').toBeGreaterThan(-1);
  expect(scriptIndex).toBeLessThan(stylesheetIndex);
  expect(scriptIndex).toBeLessThan(bodyIndex);
});

test('AC-18: класс dark стоит на html без ожидания гидратации', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./', { waitUntil: 'commit' });
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('AC-17: при первом визите тема берётся из системной', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('./');
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('AC-16: выбор темы переживает перезагрузку', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('./');

  // Ждём гидратацию острова: до неё кнопка есть в разметке, но обработчика на ней
  // нет, и клик молча ничего не делает. Astro снимает атрибут ssr с <astro-island>
  // ровно в момент гидратации — это надёжный сигнал, в отличие от таймаута.
  await page.waitForSelector('astro-island:not([ssr])');

  await page.getByRole('button', { name: /Переключить тему/i }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('AC-16: сохранённый выбор важнее системной темы', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./');
  await page.evaluate(() => localStorage.setItem('theme', 'light'));
  await page.reload();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('AC-18: гидратация острова не сбрасывает тёмную тему', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('html')).toHaveClass(/dark/);
});
