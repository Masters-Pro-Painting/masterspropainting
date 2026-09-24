// One-time photo prep. Reads the organized client photo pack, strips metadata,
// resizes to a 2000px long edge and writes web-ready JPEG masters into
// src/assets/photos. Astro then generates AVIF/WebP srcsets from these at build.
//
//   node scripts/prep-photos.mjs "<path to Masters-Pro-Painting-Organized-Images>"
import sharp from 'sharp';
import { readdirSync, statSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = process.argv[2];
if (!SRC || !existsSync(SRC)) throw new Error('Pass the organized images folder path');
const OUT = fileURLToPath(new URL('../src/assets/photos/', import.meta.url));
mkdirSync(OUT, { recursive: true });

// 009 shows the homeowner's family photos. Excluded until permission or a crop.
const EXCLUDE = new Set(['009']);

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  if (statSync(p).isDirectory()) return f === '00-start-here' ? [] : walk(p);
  return /\.jpe?g$/i.test(f) ? [p] : [];
});

let n = 0;
for (const file of walk(SRC)) {
  const id = basename(file).match(/-(\d{3})\.jpe?g$/i)?.[1];
  if (!id || EXCLUDE.has(id)) continue;
  const name = basename(file).replace(/^masters-pro-/, '').toLowerCase();
  const out = join(OUT, name);
  await sharp(readFileSync(file)).rotate().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  n++;
}
console.log(`wrote ${n} photos`);
