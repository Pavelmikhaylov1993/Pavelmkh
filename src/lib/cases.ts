import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Единственное место, задающее порядок кейсов. От него зависят и сетка на главной,
 * и навигация «предыдущий/следующий» — если развести эти сортировки по разным файлам,
 * они разъедутся молча.
 */
export async function getSortedCases(): Promise<CollectionEntry<'cases'>[]> {
  const cases = await getCollection('cases', ({ data }) => !data.draft);
  return cases.sort((a, b) => a.data.order - b.data.order);
}
