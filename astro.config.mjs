import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://nkonovalov1990.github.io',
  base: '/Pavelmkh',
  trailingSlash: 'always',
  integrations: [react(), mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
