import type { APIRoute } from 'astro';
import { STAGING, SITE } from '../data/site';

export const GET: APIRoute = () => {
  const body = STAGING
    ? 'User-agent: *\nDisallow: /\n'
    : ['User-agent: *', 'Allow: /', 'Disallow: /thank-you/', '', `Sitemap: ${SITE.url}/sitemap-index.xml`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
