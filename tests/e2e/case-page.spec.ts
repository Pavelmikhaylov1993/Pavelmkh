import { expect, test } from '@playwright/test';
import { neighbours, publishedCases } from '../helpers/cases';

const CASES = publishedCases();
const SLUGS = CASES.map((c) => c.slug);
const FIRST = CASES[0];
const LAST = CASES[CASES.length - 1];

for (const { slug, title, company } of CASES) {
  test(`AC-10: страница ${slug} содержит заголовок, компанию, роль и результат`, async ({ page }) => {
    const response = await page.goto(`./case/${slug}/`);
    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.getByTestId('case-company')).toHaveText(company);
    await expect(page.getByTestId('case-role')).not.toBeEmpty();
    await expect(page.getByTestId('case-outcome')).not.toBeEmpty();
  });

  test(`AC-19: у страницы ${slug} свой уникальный title`, async ({ page }) => {
    await page.goto(`./case/${slug}/`);
    const title = await page.title();
    expect(title).not.toBe('Павел Михайлов — Senior Product Designer');
    expect(title).toContain('Павел Михайлов');
  });
}

test('AC-19: заголовки всех кейсов уникальны между собой', async ({ page }) => {
  const titles: string[] = [];
  for (const slug of SLUGS) {
    await page.goto(`./case/${slug}/`);
    titles.push(await page.title());
  }
  expect(new Set(titles).size, `дубли среди: ${titles.join(' | ')}`).toBe(SLUGS.length);
});

// Возврат ведёт именно к сетке кейсов, а не на верх главной: человек пришёл оттуда,
// и терять его позицию незачем. Поэтому в URL ожидается якорь.
test('AC-12: со страницы кейса есть возврат к сетке кейсов', async ({ page }) => {
  await page.goto('./case/netologiya-payment-ux/');
  await page.getByRole('link', { name: /Все кейсы/ }).click();
  await expect(page).toHaveURL(/\/Pavelmkh\/#cases$/);

  // toBeInViewport() считает элемент видимым, даже когда его полностью накрыла липкая
  // шапка — оно меряет только пересечение с вьюпортом. Поэтому сверяем координаты:
  // заголовок секции обязан оказаться ниже нижней границы шапки.
  const header = (await page.locator('header').boundingBox())!;
  const heading = (await page.locator('#cases h2').boundingBox())!;
  expect(heading.y).toBeGreaterThanOrEqual(header.y + header.height);
});

// Переходы проверяем на каждой паре соседей, а не на одной выбранной руками:
// иначе сдвиг порядка ловится только там, куда случайно попал тест.
for (const { slug } of CASES) {
  const { prev, next } = neighbours(slug);

  if (next) {
    test(`AC-12: с ${slug} есть переход к следующему кейсу`, async ({ page }) => {
      await page.goto(`./case/${slug}/`);
      await page.getByRole('link', { name: /Следующий кейс/ }).click();
      await expect(page).toHaveURL(new RegExp(`/case/${next.slug}/$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(next.title);
    });
  }

  // У ветки prev в разметке своя реализация, отличная от next: есть else с распоркой
  // для флексбокса. Проверялся при этом только next — то есть сдвиг на единицу, когда
  // «предыдущий» ведёт сам на себя, поймать было нечем.
  if (prev) {
    test(`AC-12: с ${slug} есть переход к предыдущему кейсу`, async ({ page }) => {
      await page.goto(`./case/${slug}/`);
      await page.getByRole('link', { name: /Предыдущий кейс/ }).click();
      await expect(page).toHaveURL(new RegExp(`/case/${prev.slug}/$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(prev.title);
    });
  }
}

test('AC-12: у первого кейса нет ссылки «Предыдущий кейс»', async ({ page }) => {
  await page.goto(`./case/${FIRST.slug}/`);
  await expect(page.getByRole('link', { name: /Предыдущий кейс/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Следующий кейс/ })).toHaveCount(1);
});

test('AC-12: у последнего кейса нет ссылки «Следующий кейс»', async ({ page }) => {
  await page.goto(`./case/${LAST.slug}/`);
  await expect(page.getByRole('link', { name: /Следующий кейс/ })).toHaveCount(0);
});
