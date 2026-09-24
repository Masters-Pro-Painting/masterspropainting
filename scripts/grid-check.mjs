// Finds grids with partially filled rows at many viewport widths, and flags any
// where the empty slots would show a dark background (the "blacked out" bug).
//   MSYS_NO_PATHCONV=1 node scripts/grid-check.mjs http://localhost:4322 /route/ ...
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
// Needs puppeteer-core: set PUPPETEER_CORE to its path, or `npm i -D puppeteer-core`.
const puppeteer = require(process.env.PUPPETEER_CORE || 'puppeteer-core');

const [base, ...routes] = process.argv.slice(2);
const widths = [390, 768, 1024, 1280, 1440, 1680, 1920, 2000, 2560];
const browser = await puppeteer.launch({ executablePath: (process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'), headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
let dark = 0; const partial = new Set();
for (const w of widths) {
  await page.setViewport({ width: w, height: 900 });
  for (const r of routes) {
    await page.goto(base + r, { waitUntil: 'networkidle0' });
    const res = await page.evaluate(() => {
      const out = [];
      const isDark = (c) => { const m = c.match(/\d+/g); if (!m || (c.includes('rgba') && Number(m[3]) === 0)) return false; const [r, g, b] = m.map(Number); return (r + g + b) / 3 < 80; };
      document.querySelectorAll('main *').forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.display !== 'grid') return;
        // auto-fit collapses empty tracks to 0px; only real columns can leave a hole
        const cols = cs.gridTemplateColumns.split(' ').filter((t) => t && parseFloat(t) > 0).length;
        const items = [...el.children].filter((c) => !c.hidden && getComputedStyle(c).display !== 'none' && getComputedStyle(c).position !== 'absolute').length;
        if (cols < 2 || items <= cols) return;
        const rem = items % cols;
        if (rem !== 0) out.push({ cls: el.className.toString().slice(0, 40), cols, items, dark: isDark(cs.backgroundColor) });
      });
      return out;
    });
    for (const g of res) {
      if (g.dark) { dark++; console.log(`DARK GAP ${w}px ${r} .${g.cls} cols=${g.cols} items=${g.items}`); }
      else partial.add(`${g.cls} (${g.items} items in ${g.cols} cols)`);
    }
  }
}
console.log(dark ? `${dark} dark-gap cases` : 'No dark empty grid cells at any width.');
console.log('Partial rows with light background (cosmetic only):', [...partial].join(' | ') || 'none');
await browser.close().catch(() => {});
