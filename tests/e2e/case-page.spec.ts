import { expect, test } from '@playwright/test';

const SLUGS = [
  'cian-client-info',
  'netologiya-payment-ux',
  'netologiya-coordinator-payouts',
  'netologiya-b2b-research',
  'netologiya-ticket-messages',
  'dellin-accounting-docs',
];

const CASES: Record<string, { heading: string; company: string }> = {
  'cian-client-info': { heading: 'Информация о клиенте в чатах', company: 'Циан' },
  'netologiya-payment-ux': { heading: 'Улучшение UX в блоке оплаты', company: 'Нетология' },
  'netologiya-coordinator-payouts': { heading: 'Выплаты координаторам', company: 'Нетология' },
  'netologiya-b2b-research': { heading: 'Исследование B2B пользователей (HR-кабинет)', company: 'Нетология' },
  'netologiya-ticket-messages': { heading: 'Исходящие сообщения в тикет-системе', company: 'Нетология' },
  'dellin-accounting-docs': { heading: 'Заказ бухгалтерских документов', company: 'Деловые Линии' },
};

for (const slug of SLUGS) {
  test(`AC-10: страница ${slug} содержит заголовок, компанию, роль и результат`, async ({ page }) => {
    const response = await page.goto(`./case/${slug}/`);
    expect(response?.status()).toBe(200);

    const { heading, company } = CASES[slug];
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
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

test('AC-12: есть переход к следующему кейсу', async ({ page }) => {
  await page.goto('./case/cian-client-info/');
  await page.getByRole('link', { name: /Следующий кейс/ }).click();
  await expect(page).toHaveURL(/\/case\/netologiya-payment-ux\/$/);
});

// У ветки prev в разметке своя реализация, отличная от next: есть else с распоркой
// для флексбокса. Проверялся при этом только next — то есть сдвиг на единицу, когда
// «предыдущий» ведёт сам на себя, поймать было нечем.
test('AC-12: есть переход к предыдущему кейсу', async ({ page }) => {
  await page.goto('./case/netologiya-payment-ux/');
  await page.getByRole('link', { name: /Предыдущий кейс/ }).click();
  await expect(page).toHaveURL(/\/case\/cian-client-info\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Информация о клиенте в чатах',
  );
});

test('AC-12: у первого кейса нет ссылки «Предыдущий кейс»', async ({ page }) => {
  await page.goto('./case/cian-client-info/');
  await expect(page.getByRole('link', { name: /Предыдущий кейс/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Следующий кейс/ })).toHaveCount(1);
});

test('AC-12: у последнего кейса нет ссылки «Следующий кейс»', async ({ page }) => {
  await page.goto('./case/dellin-accounting-docs/');
  await expect(page.getByRole('link', { name: /Следующий кейс/ })).toHaveCount(0);
});
