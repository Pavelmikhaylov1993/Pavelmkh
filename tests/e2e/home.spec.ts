import { expect, test } from '@playwright/test';

test('AC-5: в герое есть имя, роль и био', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Павел Михайлов');
  await expect(page.getByText('Senior Product Designer').first()).toBeVisible();
  await expect(page.getByText(/5\+ годами опыта/)).toBeVisible();
});

test('AC-5a: портрет отдаётся с alt и в современном формате', async ({ page }) => {
  await page.goto('./');
  const portrait = page.locator('#hero img').first();
  await expect(portrait).toBeVisible();

  const alt = await portrait.getAttribute('alt');
  expect(alt?.trim().length ?? 0).toBeGreaterThan(0);

  const src = await portrait.getAttribute('src');
  expect(src).toMatch(/\.(avif|webp)$/);
  expect(await portrait.getAttribute('srcset')).toBeTruthy();
});

test('AC-8: три контакта ведут наружу безопасно', async ({ page }) => {
  await page.goto('./');
  const expected = [
    { name: 'Телеграм', href: 'https://t.me/Pavelmkh' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/pavel-mikhaylov93/' },
    { name: 'Behance', href: 'https://www.behance.net/pavelm1993e4f6' },
  ];

  for (const contact of expected) {
    const link = page.locator('#contacts').getByRole('link', { name: contact.name });
    await expect(link).toHaveAttribute('href', contact.href);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
});

test('AC-9: ссылка на резюме отдаёт PDF', async ({ page, request }) => {
  await page.goto('./');
  const href = await page.locator('#contacts').getByRole('link', { name: /Резюме/ }).getAttribute('href');
  expect(href).toBe('/Pavelmkh/Pavel_Mikhaylov_CV.pdf');

  const response = await request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
});
