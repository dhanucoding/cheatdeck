import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const sheets = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/sheets' }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    topic: z.string(),
    order: z.number().default(100),
    featured: z.boolean().default(false),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
    updated: z.coerce.date(),
    related: z.array(z.string()).default([]),
  }),
});

export const collections = { sheets };
