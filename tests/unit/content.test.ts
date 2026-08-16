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

// Список кейсов больше не дублируется руками: он читается из папки, как и на сайте.
// Взамен явного перечисления проверяем структуру — так добавление кейса ничего
// не ломает, но потеря кейса или сбитая нумерация по-прежнему видны.
const MIN_CASES = 6;

const slugs = existsSync(CASES_DIR)
  ? readdirSync(CASES_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(caseFile(entry.name)))
      .map((entry) => entry.name)
  : [];

const orders = slugs.map(
  (slug) => matter(readFileSync(caseFile(slug), 'utf8')).data.order as number,
);

describe('контент кейсов', () => {
  test(`AC-1: кейсов не меньше ${MIN_CASES} и у каждого корректный slug`, () => {
    expect(slugs.length).toBeGreaterThanOrEqual(MIN_CASES);
    for (const slug of slugs) {
      expect(slug, `слаг «${slug}»`).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  test('AC-1: order уникальны и идут подряд с единицы', () => {
    expect([...orders].sort((a, b) => a - b)).toEqual(
      Array.from({ length: slugs.length }, (_, i) => i + 1),
    );
  });

  test('AC-2: дубликат «Заказ бухгалтерских документов» не импортирован', () => {
    expect(slugs).not.toContain('zakaz-buhgalterskih-dokumentov');
  });

  test.each(slugs)('AC-3: %s проходит валидацию схемы', (slug) => {
    const raw = readFileSync(caseFile(slug), 'utf8');
    expect(() => caseMetaSchema.parse(matter(raw).data)).not.toThrow();
  });

  test.each(slugs)('AC-3: у %s существует файл обложки', (slug) => {
    const raw = readFileSync(caseFile(slug), 'utf8');
    const { cover } = caseMetaSchema.parse(matter(raw).data);
    const absolute = resolve(dirname(caseFile(slug)), cover);
    expect(existsSync(absolute)).toBe(true);
  });

  test.each(slugs)('AC-2: в теле %s нет ссылок на yonote', (slug) => {
    const raw = readFileSync(caseFile(slug), 'utf8');
    expect(raw).not.toContain('yonote.ru');
  });

  test.each(slugs)('AC-4: у всех изображений в %s непустой alt', (slug) => {
    const body = matter(readFileSync(caseFile(slug), 'utf8')).content;
    const images = [...body.matchAll(/!\[(.*?)\]\((.*?)\)/g)];
    for (const [, alt] of images) {
      expect(alt.trim().length).toBeGreaterThan(0);
    }
  });

  // Английская версия. Список тот же самый, что и у русской: сетка на /en/ строится
  // из тех же папок. Если у кейса не окажется index.en.mdx, английская главная молча
  // отрендерится с дырой — проверяем наличие пары явно.
  test.each(slugs)('AC-31: у %s есть английская версия', (slug) => {
    expect(existsSync(caseFileEn(slug))).toBe(true);
  });

  test.each(slugs)('AC-31: английский %s проходит валидацию схемы', (slug) => {
    const raw = readFileSync(caseFileEn(slug), 'utf8');
    expect(() => caseMetaSchema.parse(matter(raw).data)).not.toThrow();
  });

  test.each(slugs)('AC-31: у английского %s существует файл обложки', (slug) => {
    const raw = readFileSync(caseFileEn(slug), 'utf8');
    const { cover } = caseMetaSchema.parse(matter(raw).data);
    expect(existsSync(resolve(dirname(caseFileEn(slug)), cover))).toBe(true);
  });

  // Порядок задаётся полем order и должен совпадать: иначе на двух языках кейсы
  // выстроятся по-разному, а ссылки «предыдущий/следующий» разъедутся между версиями.
  test.each(slugs)('AC-31: у %s одинаковый order в обеих версиях', (slug) => {
    const ru = caseMetaSchema.parse(matter(readFileSync(caseFile(slug), 'utf8')).data);
    const en = caseMetaSchema.parse(matter(readFileSync(caseFileEn(slug), 'utf8')).data);
    expect(en.order).toBe(ru.order);
  });

  test.each(slugs)('AC-31: английский %s действительно переведён', (slug) => {
    const en = matter(readFileSync(caseFileEn(slug), 'utf8'));
    const meta = caseMetaSchema.parse(en.data);
    // Кириллица в заголовке или в теле означает, что кусок текста забыли перевести.
    // Названия компаний — исключение: Cian, Netology, Delovye Linii записаны латиницей.
    expect(meta.title, 'заголовок не переведён').not.toMatch(/[а-яё]/i);
    expect(meta.summary, 'саммари не переведено').not.toMatch(/[а-яё]/i);
    expect(en.content, 'в тексте осталась кириллица').not.toMatch(/[а-яё]/i);
  });

  test.each(slugs)('AC-4: у всех изображений в английском %s непустой alt', (slug) => {
    const body = matter(readFileSync(caseFileEn(slug), 'utf8')).content;
    const images = [...body.matchAll(/!\[(.*?)\]\((.*?)\)/g)];
    expect(images.length, 'в кейсе не нашлось ни одной картинки').toBeGreaterThan(0);
    for (const [, alt] of images) {
      expect(alt.trim().length).toBeGreaterThan(0);
    }
  });

  test('AC-9: резюме на обоих языках лежит в public', () => {
    expect(existsSync('public/Pavel_Mikhaylov_CV.pdf')).toBe(true);
    expect(existsSync('public/Pavel_Mikhaylov_CV_EN.pdf')).toBe(true);
  });

  test('AC-5a: портрет лежит в assets', () => {
    expect(existsSync('src/assets/pavel.jpg')).toBe(true);
  });
});
