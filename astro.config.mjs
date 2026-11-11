// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// Project site: https://dhanucoding.github.io/cheatdeck/
export default defineConfig({
  site: 'https://dhanucoding.github.io',
  base: '/cheatdeck',
  integrations: [mdx(), preact(), sitemap({ filter: (p) => !p.endsWith('/404/') })],
  markdown: { shikiConfig: { themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' } } },
});
