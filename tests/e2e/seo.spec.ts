import { expect, test } from '@playwright/test';

test('AC-19: у главной осмысленные title и description', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveTitle(/Павел Михайлов/);
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(description?.length ?? 0).toBeGreaterThan(50);
});

test('AC-20: у главной есть OG-теги и canonical с абсолютным URL', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);

  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(ogImage).toMatch(/^https:\/\/nkonovalov1990\.github\.io\/Pavelmkh\//);

  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(canonical).toBe('https://nkonovalov1990.github.io/Pavelmkh/');
});

test('AC-15: шапка помещается на мобильном без горизонтального скролла', async ({ page }) => {
  await page.goto('./');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

const SLUGS = [
  'cian-client-info',
  'netologiya-payment-ux',
  'netologiya-coordinator-payouts',
  'netologiya-b2b-research',
  'netologiya-ticket-messages',
  'dellin-accounting-docs',
];

test('AC-21: sitemap содержит главную и все 6 кейсов', async ({ request }) => {
  const index = await request.get('/Pavelmkh/sitemap-index.xml');
  expect(index.status()).toBe(200);

  // В индексе лежит абсолютный продакшн-URL. Берём из него только путь, иначе запрос
  // уйдёт на живой github.io вместо локальной preview-сборки, которую мы и проверяем.
  const sitemapPath = new URL((await index.text()).match(/<loc>(.*?)<\/loc>/)![1]).pathname;
  const sitemap = await (await request.get(sitemapPath)).text();

  expect(sitemap).toContain('https://nkonovalov1990.github.io/Pavelmkh/');
  for (const slug of SLUGS) {
    expect(sitemap, `в карте нет ${slug}`).toContain(`/Pavelmkh/case/${slug}/`);
  }
});

// Раньше OG и canonical проверялись только на главной. Между тем формула в
// BaseHead складывает Astro.site с путём, и именно на вложенном маршруте она может
// потерять или задвоить base — тогда все шесть кейсов укажут canonical на одну
// страницу и склеятся в поиске, а превью в мессенджерах отвалится. Ради превью
// сайт и делался вместо шаринга вики.
for (const slug of SLUGS) {
  test(`AC-20: у кейса ${slug} корректные canonical и og:image`, async ({ page }) => {
    await page.goto(`./case/${slug}/`);

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://nkonovalov1990.github.io/Pavelmkh/case/${slug}/`,
    );

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toMatch(/^https:\/\/nkonovalov1990\.github\.io\/Pavelmkh\/[^/]/);
    expect(ogImage, 'base задвоился').not.toContain('/Pavelmkh/Pavelmkh/');

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBe(await page.title());

    const description = await page
      .locator('meta[property="og:description"]')
      .getAttribute('content');
    expect(description?.length ?? 0).toBeGreaterThan(30);
  });
}

test('AC-21: robots.txt указывает на sitemap', async ({ request }) => {
  const response = await request.get('/Pavelmkh/robots.txt');
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('sitemap-index.xml');
});

test('AC-22: неизвестный адрес отдаёт страницу 404 со ссылкой на главную', async ({ page }) => {
  await page.goto('./case/nesushchestvuyushchiy-keys/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('404');

  // Проверяем именно нашу страницу, а не стандартную заглушку Astro: у неё нет
  // ни этой ссылки, ни русского текста.
  const home = page.getByRole('link', { name: /На главную/ });
  await expect(home).toBeVisible();
  await home.click();
  await expect(page).toHaveURL(/\/Pavelmkh\/$/);
});
