import { z } from 'zod';

export const caseMetaSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  order: z.number().int().positive(),
  summary: z.string().min(1).max(200),
  role: z.array(z.string().min(1)).min(1),
  outcome: z.string().min(1),
  metrics: z
    .array(z.object({ value: z.string().min(1), label: z.string().min(1) }))
    .default([]),
  cover: z.string().min(1),
  year: z.number().int().optional(),
  draft: z.boolean().default(false),
});

export type CaseMeta = z.infer<typeof caseMetaSchema>;
