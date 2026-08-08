import { expect, test } from '@playwright/test';
import { publishedCases } from '../helpers/cases';

const CASES = publishedCases();
const FIRST = CASES[0];

test(`AC-6: на главной ровно ${CASES.length} карточек кейсов`, async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#cases article')).toHaveCount(CASES.length);
});

test('AC-6: первым идёт кейс Циана', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#cases article').first()).toContainText('Циан');
});

// Проверяем именно текст заголовка, а не факт его наличия: пока страниц кейсов нет,
// клик уводит на стандартную 404 Astro, у которой тоже есть h1 — на `toBeVisible()`
// тест был бы зелёным по неверной причине. До Задачи 9 он обязан быть красным.
test('AC-7: клик по карточке ведёт на страницу кейса', async ({ page }) => {
  await page.goto('./');
  await page.locator('#cases article a').first().click();
  await expect(page).toHaveURL(new RegExp(`/Pavelmkh/case/${FIRST.slug}/$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(FIRST.title);
});

test('AC-14: на десктопе сетка минимум в две колонки', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'только десктоп');
  await page.goto('./');
  const cards = page.locator('#cases article');
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  expect(first!.y).toBeCloseTo(second!.y, 0);
});

test('AC-14: на мобильном сетка в одну колонку', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'только мобильный');
  await page.goto('./');
  const cards = page.locator('#cases article');
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  expect(second!.y).toBeGreaterThan(first!.y + first!.height - 1);
});
