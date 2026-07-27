import { describe, expect, test } from 'vitest';
import { caseMetaSchema } from '@/lib/case-schema';

const valid = {
  title: 'Улучшение UX в блоке оплаты',
  company: 'Нетология',
  order: 2,
  summary: 'Переработал блок оплаты в админке продаж.',
  role: ['Исследование', 'Интервью'],
  outcome: '−50% времени на оформление заказа',
  cover: '../../assets/cases/netologiya-payment-ux/01.png',
};

describe('caseMetaSchema', () => {
  test('AC-1: принимает корректный frontmatter', () => {
    expect(() => caseMetaSchema.parse(valid)).not.toThrow();
  });

  test('AC-1: metrics по умолчанию пустой массив', () => {
    expect(caseMetaSchema.parse(valid).metrics).toEqual([]);
  });

  test('AC-1: draft по умолчанию false', () => {
    expect(caseMetaSchema.parse(valid).draft).toBe(false);
  });

  test('AC-3: пустой title отвергается', () => {
    expect(() => caseMetaSchema.parse({ ...valid, title: '' })).toThrow();
  });

  test('AC-3: пустой role отвергается', () => {
    expect(() => caseMetaSchema.parse({ ...valid, role: [] })).toThrow();
  });

  test('AC-3: отсутствующий cover отвергается', () => {
    const { cover, ...withoutCover } = valid;
    expect(() => caseMetaSchema.parse(withoutCover)).toThrow();
  });

  test('AC-1: summary длиннее 200 символов отвергается', () => {
    expect(() => caseMetaSchema.parse({ ...valid, summary: 'я'.repeat(201) })).toThrow();
  });

  test('AC-1: metrics требует value и label', () => {
    expect(() => caseMetaSchema.parse({ ...valid, metrics: [{ value: '+5,3%' }] })).toThrow();
  });
});
