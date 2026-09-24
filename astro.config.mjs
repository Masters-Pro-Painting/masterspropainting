// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Production domain. Staging builds still use it for canonicals, but every
// page ships noindex until PUBLIC_STAGING=false (see src/data/site.ts).
export default defineConfig({
  site: 'https://masterspropaint.com',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    sitemap({ filter: (page) => !/\/(thank-you|free-estimate)\/$/.test(page) }),
  ],
  image: { responsiveStyles: false },
});
