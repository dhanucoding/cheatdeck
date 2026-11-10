// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';

// Project site: https://dhanucoding.github.io/cheatdeck/
export default defineConfig({
  site: 'https://dhanucoding.github.io',
  base: '/cheatdeck',
  integrations: [mdx(), preact()],
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } } },
});
