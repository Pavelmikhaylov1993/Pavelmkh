import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

/**
 * Единый источник правды о кейсах для тестов.
 *
 * Раньше списки слагов лежали в каждом тесте руками. Это ловило случайную
 * потерю кейса, но при добавлении нового приходилось править четыре файла,
 * а тесты, завязанные на порядок, падали уже после пуша. Теперь список
 * читается из content/cases — как это делает и сам сайт.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const CASES_DIR = join(ROOT, 'content', 'cases');

export type CaseInfo = {
  slug: string;
  order: number;
  title: string;
  company: string;
  draft: boolean;
};

function read(slug: string, file = 'index.mdx'): CaseInfo {
  const raw = readFileSync(join(CASES_DIR, slug, file), 'utf8');
  const { data } = matter(raw);
  return {
    slug,
    order: Number(data.order),
    title: String(data.title ?? ''),
    company: String(data.company ?? ''),
    draft: data.draft === true,
  };
}

/** Все кейсы, включая черновики. Порядок не гарантирован. */
export function allCases(): CaseInfo[] {
  if (!existsSync(CASES_DIR)) return [];
  return readdirSync(CASES_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(CASES_DIR, e.name, 'index.mdx')))
    .map((e) => read(e.name));
}

/** Опубликованные кейсы в том порядке, в каком их показывает сайт. */
export function publishedCases(): CaseInfo[] {
  return allCases()
    .filter((c) => !c.draft)
    .sort((a, b) => a.order - b.order);
}

export const slugs = (): string[] => publishedCases().map((c) => c.slug);

/**
 * Английские версии тех же кейсов — index.en.mdx рядом с index.mdx. Слаг и порядок
 * общие с русской версией: адрес у английской страницы тот же, только с /en/ впереди.
 * Совпадение order проверяет tests/unit/content.test.ts, критерий AC-31.
 */
export function publishedCasesEn(): CaseInfo[] {
  return publishedCases()
    .filter((c) => existsSync(join(CASES_DIR, c.slug, 'index.en.mdx')))
    .map((c) => read(c.slug, 'index.en.mdx'))
    .filter((c) => !c.draft)
    .sort((a, b) => a.order - b.order);
}

/** Сосед по порядку: пригождается тестам переходов «предыдущий / следующий». */
export function neighbours(slug: string): { prev?: CaseInfo; next?: CaseInfo } {
  const list = publishedCases();
  const i = list.findIndex((c) => c.slug === slug);
  return { prev: list[i - 1], next: list[i + 1] };
}
