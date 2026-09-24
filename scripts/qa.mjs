// Post-build QA over dist/. Run: node scripts/qa.mjs
// Checks: one H1, title/description length, JSON-LD parses, internal links
// resolve, #estimate target exists, distinct photo count on service/area/LP
// pages, banned words and em dashes in our copy (review quotes excluded),
// and text overlap between pages (shingle Jaccard).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// QA_DIST=path/to/build-folder to check a build other than dist/ (e.g. dist-hostinger)
const DIST = process.env.QA_DIST ? process.env.QA_DIST.replace(/[\\/]?$/, '/') : fileURLToPath(new URL('../dist/', import.meta.url));
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const pages = walk(DIST).filter((p) => p.endsWith('.html'));
const BANNED = /\b(game-changer|revolutionary|unlock|leverage|seamless(ly)?|dive in|delve)\b/i;

const problems = [];
const texts = {};
const rows = [];

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const route = '/' + relative(DIST, file).replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '');
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  if (h1s !== 1) problems.push(`${route}: ${h1s} h1 tags`);
  if (title.length > 90) problems.push(`${route}: title ${title.length} chars`);
  if (desc.length < 70 || desc.length > 200) problems.push(`${route}: description ${desc.length} chars`);

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { problems.push(`${route}: bad JSON-LD ${e.message}`); }
  }

  for (const m of html.matchAll(/href="(\/[^"#?]*)(#[^"]*)?"/g)) {
    const path = m[1];
    if (path.startsWith('/_astro/')) continue;
    const target = path.endsWith('/') ? join(DIST, path, 'index.html') : join(DIST, path);
    if (!existsSync(target)) problems.push(`${route}: broken link ${path}`);
  }
  if (html.includes('href="#estimate"') && !html.includes('id="estimate"') && route !== '/thank-you/' && route !== '/404') {
    problems.push(`${route}: #estimate link with no form`);
  }

  const main = html.split('<main>')[1]?.split('</main>')[0] ?? '';
  const photoIds = new Set([...main.matchAll(/\/_astro\/[a-z0-9-]+-(\d{3})\.[\w-]+\.(?:webp|jpg)/g)].map((m) => m[1]));
  const noQuotes = main.replace(/<blockquote>[\s\S]*?<\/blockquote>/g, '');
  const visible = noQuotes.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();
  if (visible.includes('—')) problems.push(`${route}: em dash in copy: ...${visible.slice(Math.max(0, visible.indexOf('—') - 40), visible.indexOf('—') + 20)}...`);
  if (BANNED.test(visible)) problems.push(`${route}: banned word "${visible.match(BANNED)[0]}"`);
  const isCore = /^\/(service-areas\/[a-z-]+\/|interior-painting|exterior-painting|cabinet-painting|commercial-painting|staining-wood-refinishing|epoxy-flooring|drywall-repair|free-estimate)/.test(route);
  if (isCore && photoIds.size !== 8) problems.push(`${route}: ${photoIds.size} distinct photos (want 8)`);
  const words = visible.toLowerCase().split(/\s+/).filter(Boolean);
  texts[route] = words;
  rows.push({ route, words: words.length, photos: photoIds.size, title: title.length, desc: desc.length });
}

// Text overlap between comparable pages, excluding shared chrome (already outside <main>).
const shingles = (w, n = 6) => { const s = new Set(); for (let i = 0; i + n <= w.length; i++) s.add(w.slice(i, i + n).join(' ')); return s; };
const groups = [
  Object.keys(texts).filter((r) => /^\/service-areas\/[a-z-]+\/$/.test(r)),
  Object.keys(texts).filter((r) => /^\/(interior|exterior|cabinet|commercial)-painting\/$|^\/(staining-wood-refinishing|epoxy-flooring|drywall-repair)\/$/.test(r)),
];
const overlap = [];
for (const group of groups) {
  const sh = Object.fromEntries(group.map((r) => [r, shingles(texts[r])]));
  for (let i = 0; i < group.length; i++) for (let j = i + 1; j < group.length; j++) {
    const a = sh[group[i]], b = sh[group[j]];
    let inter = 0; for (const x of a) if (b.has(x)) inter++;
    const jac = inter / (a.size + b.size - inter);
    overlap.push({ pair: `${group[i]} vs ${group[j]}`, jac });
  }
}
overlap.sort((x, y) => y.jac - x.jac);

console.table(rows.sort((a, b) => a.route.localeCompare(b.route)));
console.log('Highest text overlap (6-word shingles, Jaccard):');
for (const o of overlap.slice(0, 6)) console.log(`  ${(o.jac * 100).toFixed(1)}%  ${o.pair}`);
console.log(problems.length ? `\n${problems.length} problem(s):\n- ${problems.join('\n- ')}` : '\nNo problems found.');
process.exit(problems.length ? 1 : 0);
