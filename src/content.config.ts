import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { caseMetaSchema } from './lib/case-schema';

const cases = defineCollection({
  // Кейсы лежат в корневой папке content/, а не в src/ — туда ходит человек,
  // который правит тексты, и ему незачем разбираться в устройстве исходников.
  // Каждый кейс — своя папка: index.mdx и его картинки рядом.
  // Английская версия кейса — index.en.mdx в той же папке. Так картинки не надо
  // дублировать (они лежат рядом и в обоих файлах адресуются как ./NN.png), а
  // человек, правящий тексты, видит оба языка одного кейса в одном месте.
  loader: glob({
    pattern: '**/index*.mdx',
    base: './content/cases',
    // Без этого идентификатором стал бы «slug/index», а он попадает прямо в URL.
    // Английские кейсы получают префикс «en/» — по нему их отбирает getSortedCases().
    generateId: ({ entry }) => {
      const [slug, file] = entry.split('/');
      return file === 'index.en.mdx' ? `en/${slug}` : slug;
    },
  }),
  schema: ({ image }) => caseMetaSchema.extend({ cover: image() }),
});

export const collections = { cases };
