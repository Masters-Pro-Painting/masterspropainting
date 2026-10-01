// Read-only check of the live site. Never submits the form (a test lead would
// reach DripJobs through Zapier).
//
//   npm run build && node scripts/verify-live.mjs https://masterspropaint.com
//   node scripts/verify-live.mjs https://<project>.netlify.app --staging
//     (--staging expects noindex and skips the redirect and tracking checks)
import { readFileSync, readdirSync, statSync } from 'node:fs';
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

// A. every page is served by the new site, with the right robots setting
for (const r of routes) {
  const res = await get(r);
  const html = res.status === 200 ? await res.text() : '';
  const isNew = html.includes('class="topbar"');
  const wpLeak = /wp-content\/themes|elementor/i.test(html);
  const needsForm = !/^\/(thank-you|privacy-policy)\/$/.test(r);
  const noindexPage = /^\/(thank-you|free-estimate)\/$/.test(r);
  const indexable = html.includes('content="index, follow');
  const okIndex = STAGING ? !indexable : noindexPage ? !indexable : indexable;
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
  const rules = readFileSync(join(ROOT, 'public', '_redirects'), 'utf8').split(/\r?\n/)
    .map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => l.split(/\s+/));
  // Path rules only. Whole-domain rules (they start with http) are checked in C2.
  const map = rules.filter(([from]) => !/^https?:\/\//.test(from))
    .map(([from, to]) => [from.includes('*') ? from.replace('*', 'example/') : from, to]);
  for (const [from, to] of map) {
    try {
      const res = await get(from);
      const loc = (res.headers.get('location') || '').replace(base, '');
      check(res.status === 301 && loc === to, `redirect ${from}`, `${res.status} -> ${loc || '(none)'} (want ${to})`);
    } catch (e) { check(false, `redirect ${from}`, e.message); }
  }

  // C2. the Netlify address goes to the real domain, path and query kept
  try {
    const res = await fetch('https://masterspropainting.netlify.app/interior-painting/?x=1', { redirect: 'manual', headers: UA });
    const loc = res.headers.get('location') || '';
    check(res.status === 301 && loc === 'https://masterspropaint.com/interior-painting/?x=1', 'netlify.app address redirects to the domain', `${res.status} -> ${loc || '(none)'}`);
  } catch (e) { check(false, 'netlify.app address redirects to the domain', e.message); }
}

// D/E. robots + sitemap
{
  const robots = await (await get('/robots.txt')).text();
  check(STAGING ? /^Disallow: \/\s*$/m.test(robots) : robots.includes('sitemap-index.xml') && !/^Disallow: \/\s*$/m.test(robots), 'robots.txt', robots.split('\n').slice(0, 3).join(' | '));
  const sm = await get('/sitemap-index.xml');
  check(sm.status === 200 && (await sm.text()).includes('<sitemapindex'), 'sitemap-index.xml', String(sm.status));
  const s0 = await get('/sitemap-0.xml');
  const s0t = s0.status === 200 ? await s0.text() : '';
  const missing = routes.filter((r) => !/^\/(thank-you|free-estimate)\/$/.test(r) && !s0t.includes(`${r}</loc>`));
  check(s0.status === 200 && missing.length === 0, 'sitemap lists every page', missing.length ? `missing ${missing.join(', ')}` : `${routes.length - 2} pages`);
}

// F. images served as webp with a long cache; security headers on pages
{
  const homeRes = await get('/');
  const home = await homeRes.text();
  const img = home.match(/\/_astro\/[^"' ]+\.webp/)?.[0];
  if (img) {
    const res = await get(img);
    const cc = res.headers.get('cache-control') || '';
    check(res.status === 200 && /image\/webp/.test(res.headers.get('content-type') || ''), 'image serves as webp', `${res.status} ${res.headers.get('content-type')}`);
    check(/immutable|max-age=31536000/.test(cc), 'image long cache', cc || '(no cache-control)');
  } else check(false, 'image found on homepage');
  check((homeRes.headers.get('x-content-type-options') || '') === 'nosniff', 'security headers on pages', homeRes.headers.get('x-content-type-options') || '(missing)');
  // Netlify's free-plan badge sits on the mobile Free Estimate button unless the page lifts it.
  const badge = home.includes('netlify/scripts/hud');
  check(!badge || home.includes('nl-badge-frame'), 'Netlify badge is off, or lifted clear of the button bar', badge ? 'badge on, lift present' : 'badge off');
}

// G. form + tracking present
{
  const html = await (await get('/interior-painting/')).text();
  check(/name="form-name" value="estimate"/.test(html), 'Netlify form "estimate" on pages');
  if (!STAGING) {
    // Compare the same cleaned-up values the site renders (src/data/site.ts), not the raw text.
    const toml = readFileSync(join(ROOT, 'netlify.toml'), 'utf8');
    const raw = (key) => ((toml.match(new RegExp(key + '\\s*=\\s*"([^"]*)"')) || [])[1] || '').trim();
    const ga4 = (raw('PUBLIC_GA4_ID').match(/\bG-[A-Z0-9]{6,}\b/i) || [''])[0].toUpperCase();
    const adsNum = (raw('PUBLIC_ADS_ID').match(/^(?:AW-)?(\d{6,})/i) || [])[1];
    const ads = adsNum ? `AW-${adsNum}` : '';
    const label = (key) => raw(key).replace(/^AW-\d+\//i, '');
    check(!!ga4 && !!ads, 'tracking IDs set in netlify.toml', `ga4=${ga4 || '(empty)'} ads=${ads || '(empty)'}`);
    check(html.includes('googletagmanager.com/gtag/js?id=') && html.includes(ga4) && html.includes(ads), 'Google tag on pages', `ga4=${ga4} ads=${ads}`);
    for (const key of ['PUBLIC_ADS_FORM_LABEL', 'PUBLIC_ADS_CALL_LABEL']) {
      const v = label(key);
      check(!!v && html.includes(v), `${key} on pages`, v || '(empty)');
    }
  }
}

const bad = results.filter((r) => !r.ok);
for (const r of results) if (!r.ok || process.argv.includes('--verbose')) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  ${r.detail}`);
console.log(`\n${results.length - bad.length}/${results.length} checks passed against ${base}${STAGING ? ' (staging mode)' : ''}`);
process.exit(bad.length ? 1 : 0);
