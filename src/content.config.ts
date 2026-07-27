import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { caseMetaSchema } from './lib/case-schema';

const cases = defineCollection({
  // Кейсы лежат в корневой папке content/, а не в src/ — туда ходит человек,
  // который правит тексты, и ему незачем разбираться в устройстве исходников.
  // Каждый кейс — своя папка: index.mdx и его картинки рядом.
  loader: glob({
    pattern: '**/index.mdx',
    base: './content/cases',
    // Без этого идентификатором стал бы «slug/index», а он попадает прямо в URL.
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) => caseMetaSchema.extend({ cover: image() }),
});

export const collections = { cases };
