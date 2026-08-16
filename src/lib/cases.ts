import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale, type Locale } from '@/lib/i18n';

/**
 * Идентификатор английского кейса — «en/<slug>» (см. src/content.config.ts).
 * Здесь единственное место, где эта договорённость читается обратно.
 */
export function caseSlug(entry: CollectionEntry<'cases'>): string {
  return entry.id.replace(/^en\//, '');
}

/**
 * Единственное место, задающее порядок кейсов. От него зависят и сетка на главной,
 * и навигация «предыдущий/следующий» — если развести эти сортировки по разным файлам,
 * они разъедутся молча.
 */
export async function getSortedCases(
  lang: Locale = defaultLocale,
): Promise<CollectionEntry<'cases'>[]> {
  const cases = await getCollection('cases', ({ data, id }) => {
    if (data.draft) return false;
    return lang === 'en' ? id.startsWith('en/') : !id.startsWith('en/');
  });

  return cases.sort((a, b) => a.data.order - b.data.order);
}
