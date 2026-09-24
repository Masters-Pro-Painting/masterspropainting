// Photo usage audit over dist/. Run after a build: node scripts/photo-audit.mjs [IMAGE-INDEX.csv]
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const INDEX = process.argv[2];
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const pages = walk(DIST).filter((p) => p.endsWith('.html'));

const use = {};
for (const p of pages) {
  const h = readFileSync(p, 'utf8');
  const main = (h.split('<main>')[1] || '').split('</main>')[0];
  const ids = new Set([...main.matchAll(/\/_astro\/[a-z0-9-]+-(\d{3})\.[\w-]+\.(?:webp|jpg)/g)].map((m) => m[1]));
  const route = '/' + relative(DIST, p).split('\\').join('/').replace(/index\.html$/, '');
  for (const id of ids) (use[id] ||= []).push(route);
}

const parse = (l) => { const o = []; let c = '', q = false; for (const ch of l) { if (ch === '"') { q = !q; continue; } if (ch === ',' && !q) { o.push(c); c = ''; continue; } c += ch; } o.push(c); return o; };
let all;
if (INDEX && existsSync(INDEX)) {
  all = readFileSync(INDEX, 'utf8').trim().split(/\r?\n/).slice(1).map(parse).map((r) => ({ id: r[0], folder: r[2], desc: r[3], note: r[10] }));
} else {
  all = [];
}
// photos added after the original pack (e.g. the 101+ exterior batch)
const known = new Set(all.map((a) => a.id));
for (const f of readdirSync(fileURLToPath(new URL('../src/assets/photos/', import.meta.url)))) {
  const id = f.match(/-(\d{3})\.jpg$/)?.[1];
  if (id && !known.has(id)) all.push({ id, folder: 'added', desc: f.replace(/-\d{3}\.jpg$/, '').replace(/-/g, ' '), note: 'added after the original pack' });
}
const used = all.filter((a) => use[a.id]);
const unused = all.filter((a) => !use[a.id]);
const counts = used.map((a) => use[a.id].length);
const bucket = (c) => (c === 1 ? '1 page' : c <= 3 ? '2-3 pages' : c <= 6 ? '4-6 pages' : c <= 10 ? '7-10 pages' : '11+ pages');
const buckets = {};
for (const c of counts) buckets[bucket(c)] = (buckets[bucket(c)] || 0) + 1;

console.log(`photos in pack: ${all.length} | used: ${used.length} | unused: ${unused.length} | pages: ${pages.length}`);
console.log(`placements: ${counts.reduce((a, b) => a + b, 0)}`);
console.log('usage spread:', JSON.stringify(buckets));
console.log('\nMost reused:');
[...used].sort((a, b) => use[b.id].length - use[a.id].length).slice(0, 12).forEach((a) => console.log(`  ${a.id}  ${use[a.id].length} pages  ${a.desc}`));
console.log('\nUnused:');
unused.forEach((a) => console.log(`  ${a.id}  [${a.folder}]  ${a.desc} :: ${a.note}`));
