import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PATHS = [
  './',
  './case/cian-client-info/',
  './case/netologiya-payment-ux/',
  './case/netologiya-coordinator-payouts/',
  './case/netologiya-b2b-research/',
  './case/netologiya-ticket-messages/',
  './case/dellin-accounting-docs/',
];

for (const path of PATHS) {
  for (const scheme of ['light', 'dark'] as const) {
    test(`AC-23, AC-25: ${path} без нарушений axe в теме ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(path);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const blocking = results.violations.filter((violation) =>
        ['serious', 'critical'].includes(violation.impact ?? ''),
      );

      expect(
        blocking.map((violation) => `${violation.id}: ${violation.help}`),
      ).toEqual([]);
    });
  }
}

test('AC-4: alt непустой у содержательных картинок, пустой у декоративных', async ({ page }) => {
  for (const path of PATHS) {
    await page.goto(path);

    // Пустой alt допустим только у картинки внутри ссылки, где тот же смысл уже
    // передан текстом — иначе скринридер озвучит одно и то же дважды.
    const offenders = await page.locator('img').evaluateAll((nodes) =>
      nodes
        .filter((node) => {
          const image = node as HTMLImageElement;
          if (image.alt.trim().length > 0) return false;
          const link = image.closest('a');
          return !(link && (link.textContent ?? '').trim().length > 0);
        })
        .map((node) => (node as HTMLImageElement).currentSrc),
    );

    expect(offenders, `картинки с пустым alt вне ссылки с текстом на ${path}`).toEqual([]);
  }
});

test('AC-24: фокус доходит до всех интерактивных элементов шапки', async ({ page }) => {
  await page.goto('./');

  const expected = await page.locator('header a, header button').count();
  const reached = new Set<string>();

  for (let step = 0; step < expected + 2; step += 1) {
    await page.keyboard.press('Tab');
    const inHeader = await page.evaluate(() => {
      const active = document.activeElement;
      if (!active || !active.closest('header')) return null;
      return `${active.tagName}:${(active.textContent ?? '').trim() || active.getAttribute('aria-label')}`;
    });
    if (inHeader) reached.add(inHeader);
  }

  expect(reached.size, `дошли до ${[...reached].join(', ')}`).toBe(expected);
});
