import { expect, test, type Page } from '@playwright/test';

/**
 * Лайтбокс — остров с client:visible, он гидратируется по IntersectionObserver и
 * тянет за собой рантайм React. До гидратации картинки уже есть в разметке, но
 * обработчиков на них нет, и клик уходит в пустоту: Playwright проверяет только
 * доступность DOM-узла, а не наличие слушателя. Astro снимает атрибут ssr с
 * <astro-island> ровно в момент гидратации — это и ждём.
 */
async function openFirstImage(page: Page) {
  const firstImage = page.locator('.prose-case img').first();
  await firstImage.scrollIntoViewIfNeeded();
  await page.waitForSelector('astro-island:not([ssr])');
  await firstImage.click();
  return firstImage;
}

test('AC-11: изображение кейса открывается и закрывается по Esc', async ({ page }) => {
  await page.goto('./case/netologiya-payment-ux/');
  await openFirstImage(page);

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('AC-11: лайтбокс закрывается кликом вне изображения', async ({ page }) => {
  await page.goto('./case/netologiya-payment-ux/');
  await openFirstImage(page);

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Бьём по самому оверлею в его левый верхний угол — диалог центрирован, туда он
  // не достаёт. page.mouse здесь не годится: мобильный проект эмулирует тач, и
  // мышиные события до обработчика Radix не доходят.
  await page.locator('[data-slot="dialog-overlay"]').click({ position: { x: 5, y: 5 } });
  await expect(dialog).toBeHidden();
});

test('AC-11: остров лайтбокса действительно гидратируется на странице кейса', async ({ page }) => {
  await page.goto('./case/netologiya-payment-ux/');
  await page.locator('.prose-case img').first().scrollIntoViewIfNeeded();

  // Прямая защита от уже случавшегося дефекта: в закрытом состоянии компонент не
  // рендерил ни одного узла, наблюдать было не за чем, и остров не гидратировался
  // никогда. Держится это на пустом div-хосте, который выглядит бессмысленным.
  await page.waitForSelector('astro-island:not([ssr])');

  const trigger = page.locator('.prose-case img').first();
  await expect(trigger).toHaveAttribute('role', 'button');
  await expect(trigger).toHaveAttribute('tabindex', '0');
});
