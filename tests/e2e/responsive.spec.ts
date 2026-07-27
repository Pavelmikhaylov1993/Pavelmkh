import { expect, test } from '@playwright/test';

const PATHS = ['./', './case/cian-client-info/', './case/netologiya-payment-ux/'];

for (const path of PATHS) {
  test(`AC-13: на ${path} нет горизонтального скролла`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('AC-15: целевые области в шапке не меньше 44 px по высоте', async ({ page }) => {
  await page.goto('./');
  const targets = page.locator('header a, header button');
  const count = await targets.count();

  expect(count, 'в шапке не нашлось интерактивных элементов').toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    const box = await targets.nth(index).boundingBox();
    const name = await targets.nth(index).innerText();
    expect(box!.height, `элемент «${name}» ниже 44px`).toBeGreaterThanOrEqual(44);
  }
});
