import { expect, test } from '@playwright/test';

/**
 * Английская версия. Локаль передаётся пропсом lang, а у пропа есть значение по
 * умолчанию 'ru' — страница, забывшая его передать, молча отрендерится по-русски и
 * ни одна проверка русской версии этого не заметит. Поэтому здесь проверяются
 * именно английские строки, а не факт того, что страница открылась.
 */

const SLUGS = [
  'cian-client-info',
  'netologiya-payment-ux',
  'netologiya-coordinator-payouts',
  'netologiya-b2b-research',
  'netologiya-ticket-messages',
  'dellin-accounting-docs',
];

test('AC-30: английская главная отдаёт английский герой и lang=en', async ({ page }) => {
  const response = await page.goto('./en/');
  expect(response?.status()).toBe(200);

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pavel Mikhaylov');
  await expect(page.getByText(/5\+ years in B2B and B2C/)).toBeVisible();
  await expect(page.locator('#cases h2')).toHaveText('Case studies');
});

test('AC-30: на английской главной те же шесть кейсов, первым Циан', async ({ page }) => {
  await page.goto('./en/');
  await expect(page.locator('#cases article')).toHaveCount(6);
  await expect(page.locator('#cases article').first()).toContainText('Cian');
  await expect(page.locator('#cases article').first()).toContainText(
    'Client information in chats',
  );
});

test('AC-30: карточка на /en/ ведёт на английскую страницу кейса', async ({ page }) => {
  await page.goto('./en/');
  await page.locator('#cases article a').first().click();
  await expect(page).toHaveURL(/\/Pavelmkh\/en\/case\/cian-client-info\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Client information in chats');
});

for (const slug of SLUGS) {
  test(`AC-30: английская страница ${slug} открывается и подписана по-английски`, async ({
    page,
  }) => {
    const response = await page.goto(`./en/case/${slug}/`);
    expect(response?.status()).toBe(200);

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // Именно подписи в первом <dl>, а не getByText: слово Outcome есть ещё и в
    // заголовке раздела внутри текста кейса, и поиск по странице нашёл бы два узла.
    const labels = page.locator('dl').first().locator('dt');
    await expect(labels.nth(0)).toHaveText('My role');
    await expect(labels.nth(1)).toHaveText('Outcome');
    await expect(page.getByTestId('case-company')).not.toBeEmpty();
  });
}

test('AC-30: русская версия кейса не съехала на английские подписи', async ({ page }) => {
  await page.goto('./case/cian-client-info/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.locator('dl').first().locator('dt').nth(0)).toHaveText('Моя роль');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Информация о клиенте в чатах',
  );
});

test('AC-32: переключатель ведёт на ту же страницу на другом языке', async ({ page }) => {
  await page.goto('./case/cian-client-info/');
  await page.getByRole('link', { name: 'Switch to English' }).click();
  await expect(page).toHaveURL(/\/Pavelmkh\/en\/case\/cian-client-info\/$/);

  await page.getByRole('link', { name: 'Смотреть на русском' }).click();
  await expect(page).toHaveURL(/\/Pavelmkh\/case\/cian-client-info\/$/);
});

test('AC-32: у обеих версий главной есть hreflang друг на друга', async ({ page }) => {
  for (const path of ['./', './en/']) {
    await page.goto(path);
    await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveAttribute(
      'href',
      'https://nkonovalov1990.github.io/Pavelmkh/',
    );
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      'href',
      'https://nkonovalov1990.github.io/Pavelmkh/en/',
    );
  }
});

test('AC-32: canonical английской главной указывает на неё саму', async ({ page }) => {
  await page.goto('./en/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://nkonovalov1990.github.io/Pavelmkh/en/',
  );
});

// Английского PDF пока нет: site.cvFile.en === null. Кнопка не должна появляться
// вовсе — вести англоязычного человека на русское резюме хуже, чем не звать никуда.
test('AC-30: на английской версии нет кнопки резюме, на русской есть', async ({ page }) => {
  await page.goto('./en/');
  await expect(page.locator('#contacts').getByRole('link', { name: /Resume/ })).toHaveCount(0);

  await page.goto('./');
  await expect(page.locator('#contacts').getByRole('link', { name: /Резюме/ })).toHaveCount(1);
});

test('AC-30: страница 404 говорит на обоих языках', async ({ page }) => {
  await page.goto('./case/nesushchestvuyushchiy-keys/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: 'На главную' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to homepage' })).toBeVisible();
});
