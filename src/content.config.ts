import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { caseMetaSchema } from './lib/case-schema';

const cases = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/cases' }),
  schema: ({ image }) => caseMetaSchema.extend({ cover: image() }),
});

export const collections = { cases };
