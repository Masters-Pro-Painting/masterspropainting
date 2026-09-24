// Read-only check of the live site. Never submits the form (a test lead would
// reach DripJobs through Zapier).
//
//   npm run build && node scripts/verify-live.mjs https://masterspropaint.com
//   node scripts/verify-live.mjs https://<project>.netlify.app --staging
//     (--staging expects noindex and skips the old-URL redirects)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = (process.argv[2] || 'https://masterspropaint.com').replace(/\/$/, '');
const STAGING = process.argv.includes('--staging');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BUILD = join(ROOT, 'dist');
const UA = { 'User-Agent': 'Mozilla/5.0 (masterspro-verify)' };

const results = [];
const check = (ok, name, detail = '') => { results.push({ ok, name, detail }); };
const get = (path, opts = {}) => fetch(base + path, { redirect: 'manual', headers: UA, ...opts });

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const routes = walk(BUILD).filter((p) => p.endsWith('index.html'))
  .map((p) => '/' + relative(BUILD, p).split('\\').join('/').replace(/index\.html$/, ''));

// A. every new page is served by the new site, not by WordPress
for (const r of routes) {
  const res = await get(r);
  const html = res.status === 200 ? await res.text() : '';
  const isNew = html.includes('class="topbar"');
  const wpLeak = /wp-content\/themes|elementor/i.test(html);
  const needsForm = !/^\/(thank-you|privacy-policy)\/$/.test(r);
  const noindexPage = /^\/(thank-you|free-estimate)\/$/.test(r);
  const indexable = html.includes('content="index, follow');
  const okIndex = STAGING ? true : noindexPage ? !indexable : indexable;
  const ok = res.status === 200 && isNew && !wpLeak && (!needsForm || html.includes('data-lead-form')) && okIndex;
  check(ok, `page ${r}`, `${res.status}${!isNew ? ' OLD-SITE' : ''}${wpLeak ? ' WP-LEAK' : ''}${!okIndex ? ' ROBOTS-META' : ''}`);
}

// B. no-trailing-slash goes to the slash version
{
  const res = await get('/interior-painting');
  const loc = res.headers.get('location') || '';
  check([301, 308].includes(res.status) && loc.replace(base, '').startsWith('/interior-painting/'), 'no-slash redirect', `${res.status} -> ${loc}`);
}

// C. old WordPress URLs redirect to the right new pages (map in public/_redirects)
if (!STAGING) {
  const rules = readFileSync(join(ROOT, 'public', '_redirects'), 'utf8').split(/?
/)
    .map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => l.split(/s+/));
  const map = rules.map(([from, to]) => [from.includes('*') ? from.replace('*', 'example/') : from, to]);
  for (const [from, to] of map) {
    const res = await get(from);
    const loc = (res.headers.get('location') || '').replace(base, '');
    check(res.status === 301 && loc === to, `redirect ${from}`, `${res.status} -> ${loc || '(none)'} (want ${to})`);
  }
}

// D/E. robots + sitemap
{
  const robots = await (await get('/robots.txt')).text();
  check(STAGING ? robots.includes('Disallow: /') : robots.includes('sitemap-index.xml') && !/^Disallow: \/\s*$/m.test(robots), 'robots.txt', robots.split('\n').slice(0, 3).join(' | '));
  const sm = await get('/sitemap-index.xml');
  check(sm.status === 200 && (await sm.text()).includes('<sitemapindex'), 'sitemap-index.xml', String(sm.status));
  const s0 = await get('/sitemap-0.xml');
  const s0t = s0.status === 200 ? await s0.text() : '';
  const missing = routes.filter((r) => !/^\/(thank-you|free-estimate)\/$/.test(r) && !s0t.includes(`${r}</loc>`));
  check(s0.status === 200 && missing.length === 0, 'sitemap lists every page', missing.length ? `missing ${missing.join(', ')}` : `${routes.length - 2} pages`);
}

// F. images: served, right type, long cache
{
  const home = await (await get('/')).text();
  const img = home.match(/\/_astro\/[^"' ]+\.webp/)?.[0];
  if (img) {
    const res = await get(img);
    const cc = res.headers.get('cache-control') || '';
    check(res.status === 200 && /image\/webp/.test(res.headers.get('content-type') || ''), 'image serves as webp', `${res.status} ${res.headers.get('content-type')}`);
    check(STAGING || /immutable|max-age=31536000/.test(cc), 'image long cache', cc || '(no cache-control)');
  } else check(false, 'image found on homepage');
}

// G. form + tracking present
{
  const html = await (await get('/interior-painting/')).text();
  check(/name="form-name" value="estimate"/.test(html), 'Netlify form "estimate" on pages');
  const toml = readFileSync(join(ROOT, 'netlify.toml'), 'utf8');
  const ga4 = (toml.match(/PUBLIC_GA4_ID = "([^"]*)"/) || [])[1] || '';
  const ads = (toml.match(/PUBLIC_ADS_ID = "([^"]*)"/) || [])[1] || '';
  if (ga4 || ads) check(html.includes('googletagmanager.com/gtag/js?id=') && (!ga4 || html.includes(ga4)) && (!ads || html.includes(ads)), 'Google tag on pages', `ga4=${ga4 || '-'} ads=${ads || '-'}`);
}

const bad = results.filter((r) => !r.ok);
for (const r of results) if (!r.ok || process.argv.includes('--verbose')) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  ${r.detail}`);
console.log(`\n${results.length - bad.length}/${results.length} checks passed against ${base}${STAGING ? ' (staging mode)' : ''}`);
process.exit(bad.length ? 1 : 0);
