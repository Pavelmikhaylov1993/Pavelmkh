import { expect, test } from '@playwright/test';
import { publishedCases, publishedCasesEn } from '../helpers/cases';

/**
 * Английская версия. Локаль передаётся пропсом lang, а у пропа есть значение по
 * умолчанию 'ru' — страница, забывшая его передать, молча отрендерится по-русски и
 * ни одна проверка русской версии этого не заметит. Поэтому здесь проверяются
 * именно английские строки, а не факт того, что страница открылась.
 */

const cases = publishedCasesEn();
const first = cases[0];

test('AC-30: английская главная отдаёт английский герой и lang=en', async ({ page }) => {
  const response = await page.goto('./en/');
  expect(response?.status()).toBe(200);

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pavel Mikhaylov');
  await expect(page.getByText(/5\+ years in B2B and B2C/)).toBeVisible();
  await expect(page.locator('#cases h2')).toHaveText('Case studies');
});

test('AC-30: на английской главной те же кейсы и в том же порядке', async ({ page }) => {
  await page.goto('./en/');
  await expect(page.locator('#cases article')).toHaveCount(publishedCases().length);
  await expect(page.locator('#cases article').first()).toContainText(first.title);
  await expect(page.locator('#cases article').first()).toContainText(first.company);
});

test('AC-30: карточка на /en/ ведёт на английскую страницу кейса', async ({ page }) => {
  await page.goto('./en/');
  await page.locator('#cases article a').first().click();
  await expect(page).toHaveURL(new RegExp(`/Pavelmkh/en/case/${first.slug}/$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(first.title);
});

for (const item of cases) {
  test(`AC-30: английская страница ${item.slug} открывается и подписана по-английски`, async ({
    page,
  }) => {
    const response = await page.goto(`./en/case/${item.slug}/`);
    expect(response?.status()).toBe(200);

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(item.title);

    // Именно подписи в первом <dl>, а не getByText: слово Outcome есть ещё и в
    // заголовке раздела внутри текста кейса, и поиск по странице нашёл бы два узла.
    const labels = page.locator('dl').first().locator('dt');
    await expect(labels.nth(0)).toHaveText('My role');
    await expect(labels.nth(1)).toHaveText('Outcome');
  });
}

test('AC-30: русская версия кейса не съехала на английские подписи', async ({ page }) => {
  const ru = publishedCases()[0];
  await page.goto(`./case/${ru.slug}/`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.locator('dl').first().locator('dt').nth(0)).toHaveText('Моя роль');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(ru.title);
});

test('AC-32: переключатель ведёт на ту же страницу на другом языке', async ({ page }) => {
  await page.goto(`./case/${first.slug}/`);
  await page.getByRole('link', { name: 'Switch to English' }).click();
  await expect(page).toHaveURL(new RegExp(`/Pavelmkh/en/case/${first.slug}/$`));

  await page.getByRole('link', { name: 'Смотреть на русском' }).click();
  await expect(page).toHaveURL(new RegExp(`/Pavelmkh/case/${first.slug}/$`));
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

// У каждой версии своё резюме, и подменить их местами легко: имена файлов отличаются
// одним суффиксом. Поэтому проверяем не «кнопка есть», а куда именно она ведёт и что
// по этому адресу действительно лежит PDF.
test('AC-30: каждая версия ведёт на своё резюме', async ({ page, request }) => {
  for (const [path, name, file] of [
    ['./en/', /Resume/, '/Pavelmkh/Pavel_Mikhaylov_CV_EN.pdf'],
    ['./', /Резюме/, '/Pavelmkh/Pavel_Mikhaylov_CV.pdf'],
  ] as const) {
    await page.goto(path);
    const link = page.locator('#contacts').getByRole('link', { name });
    await expect(link).toHaveAttribute('href', file);

    const response = await request.get(file);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
  }
});

test('AC-30: страница 404 говорит на обоих языках', async ({ page }) => {
  await page.goto('./case/nesushchestvuyushchiy-keys/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: 'На главную' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to homepage' })).toBeVisible();
});
