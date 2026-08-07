import { describe, expect, test } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import matter from 'gray-matter';
import { caseMetaSchema } from '@/lib/case-schema';

const CASES_DIR = 'content/cases';

// Каждый кейс — своя папка с index.mdx и картинками рядом.
// Английская версия лежит там же под именем index.en.mdx.
const caseFile = (slug: string) => join(CASES_DIR, slug, 'index.mdx');
const caseFileEn = (slug: string) => join(CASES_DIR, slug, 'index.en.mdx');

const EXPECTED_SLUGS = [
  'cian-client-info',
  'netologiya-payment-ux',
  'netologiya-coordinator-payouts',
  'netologiya-b2b-research',
  'netologiya-ticket-messages',
  'dellin-accounting-docs',
];

const slugs = existsSync(CASES_DIR)
  ? readdirSync(CASES_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(caseFile(entry.name)))
      .map((entry) => entry.name)
  : [];

describe('контент кейсов', () => {
  test('AC-1: импортировано ровно 6 кейсов с ожидаемыми slug', () => {
    expect([...slugs].sort()).toEqual([...EXPECTED_SLUGS].sort());
  });

  test('AC-2: дубликат «Заказ бухгалтерских документов» не импортирован', () => {
    expect(slugs).not.toContain('zakaz-buhgalterskih-dokumentov');
  });

  test.each(EXPECTED_SLUGS)('AC-3: %s проходит валидацию схемы', (slug) => {
    const raw = readFileSync(caseFile(slug), 'utf8');
    expect(() => caseMetaSchema.parse(matter(raw).data)).not.toThrow();
  });

  test.each(EXPECTED_SLUGS)('AC-3: у %s существует файл обложки', (slug) => {
    const raw = readFileSync(caseFile(slug), 'utf8');
    const { cover } = caseMetaSchema.parse(matter(raw).data);
    const absolute = resolve(dirname(caseFile(slug)), cover);
    expect(existsSync(absolute)).toBe(true);
  });

  test.each(EXPECTED_SLUGS)('AC-2: в теле %s нет ссылок на yonote', (slug) => {
    const raw = readFileSync(caseFile(slug), 'utf8');
    expect(raw).not.toContain('yonote.ru');
  });

  test.each(EXPECTED_SLUGS)('AC-4: у всех изображений в %s непустой alt', (slug) => {
    const body = matter(readFileSync(caseFile(slug), 'utf8')).content;
    const images = [...body.matchAll(/!\[(.*?)\]\((.*?)\)/g)];
    for (const [, alt] of images) {
      expect(alt.trim().length).toBeGreaterThan(0);
    }
  });

  // Английская версия. Сетка на /en/ строится из тех же шести папок: если у кейса
  // не окажется index.en.mdx, английская главная молча отрендерится с дырой —
  // проверяем наличие пары явно.
  test.each(EXPECTED_SLUGS)('AC-31: у %s есть английская версия', (slug) => {
    expect(existsSync(caseFileEn(slug))).toBe(true);
  });

  test.each(EXPECTED_SLUGS)('AC-31: английский %s проходит валидацию схемы', (slug) => {
    const raw = readFileSync(caseFileEn(slug), 'utf8');
    expect(() => caseMetaSchema.parse(matter(raw).data)).not.toThrow();
  });

  test.each(EXPECTED_SLUGS)('AC-31: у английского %s существует файл обложки', (slug) => {
    const raw = readFileSync(caseFileEn(slug), 'utf8');
    const { cover } = caseMetaSchema.parse(matter(raw).data);
    expect(existsSync(resolve(dirname(caseFileEn(slug)), cover))).toBe(true);
  });

  // Порядок задаётся полем order и должен совпадать: иначе на двух языках кейсы
  // выстроятся по-разному, а ссылки «предыдущий/следующий» разъедутся между версиями.
  test.each(EXPECTED_SLUGS)('AC-31: у %s одинаковый order в обеих версиях', (slug) => {
    const ru = caseMetaSchema.parse(matter(readFileSync(caseFile(slug), 'utf8')).data);
    const en = caseMetaSchema.parse(matter(readFileSync(caseFileEn(slug), 'utf8')).data);
    expect(en.order).toBe(ru.order);
  });

  test.each(EXPECTED_SLUGS)('AC-31: английский %s действительно переведён', (slug) => {
    const en = matter(readFileSync(caseFileEn(slug), 'utf8'));
    const meta = caseMetaSchema.parse(en.data);
    // Кириллица в заголовке или в теле означает, что кусок текста забыли перевести.
    // Названия компаний — исключение: Cian, Netology, Delovye Linii записаны латиницей.
    expect(meta.title, 'заголовок не переведён').not.toMatch(/[а-яё]/i);
    expect(meta.summary, 'саммари не переведено').not.toMatch(/[а-яё]/i);
    expect(en.content, 'в тексте осталась кириллица').not.toMatch(/[а-яё]/i);
  });

  test.each(EXPECTED_SLUGS)('AC-4: у всех изображений в английском %s непустой alt', (slug) => {
    const body = matter(readFileSync(caseFileEn(slug), 'utf8')).content;
    const images = [...body.matchAll(/!\[(.*?)\]\((.*?)\)/g)];
    expect(images.length, 'в кейсе не нашлось ни одной картинки').toBeGreaterThan(0);
    for (const [, alt] of images) {
      expect(alt.trim().length).toBeGreaterThan(0);
    }
  });

  test('AC-9: CV лежит в public', () => {
    expect(existsSync('public/Pavel_Mikhaylov_CV.pdf')).toBe(true);
  });

  test('AC-5a: портрет лежит в assets', () => {
    expect(existsSync('src/assets/pavel.jpg')).toBe(true);
  });
});
