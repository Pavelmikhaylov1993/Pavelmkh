// @vitest-environment node
import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import CaseCard from '@/components/CaseCard.astro';

beforeEach(() => {
  vi.stubEnv('BASE_URL', '/Pavelmkh/');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const entry = {
  id: 'netologiya-payment-ux',
  data: {
    title: 'Улучшение UX в блоке оплаты',
    company: 'Нетология',
    order: 2,
    summary: 'Переработал блок оплаты в админке продаж.',
    role: ['Исследование'],
    outcome: '−50% времени на оформление заказа',
    metrics: [],
    draft: false,
    cover: { src: '/cover.png', width: 1200, height: 800, format: 'png' },
  },
} as never;

describe('CaseCard', () => {
  test('AC-6: показывает компанию, название и результат', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CaseCard, { props: { entry } });

    expect(html).toContain('Нетология');
    expect(html).toContain('Улучшение UX в блоке оплаты');
    expect(html).toContain('−50% времени на оформление заказа');
  });

  test('AC-7: ссылка ведёт на страницу кейса с учётом base', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CaseCard, { props: { entry } });

    expect(html).toContain('href="/Pavelmkh/case/netologiya-payment-ux/"');
  });
});
