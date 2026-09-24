// Full-page screenshots for visual QA, tiled into viewable chunks.
//   node scripts/shots.mjs <baseUrl> <outDir> [route ...]
// Uses puppeteer-core + a local Chrome (CHROME_PATH).
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
// Needs puppeteer-core: set PUPPETEER_CORE to its path, or `npm i -D puppeteer-core`.
const puppeteer = require(process.env.PUPPETEER_CORE || 'puppeteer-core');

const [base = 'http://localhost:4322', out = './shots', ...routes] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const list = routes.length ? routes : ['/'];
const browser = await puppeteer.launch({ executablePath: (process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'), headless: true, args: ['--no-sandbox', '--disable-gpu'] });
const issues = [];

for (const [label, width, height] of [['desk', 1440, 900], ['mob', 390, 844]]) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error') issues.push(`${label} console: ${m.text()}`); });
  page.on('pageerror', (e) => issues.push(`${label} pageerror: ${e.message}`));
  page.on('requestfailed', (r) => issues.push(`${label} requestfailed: ${r.url()}`));
  for (const route of list) {
    await page.goto(base + route, { waitUntil: 'networkidle0' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    // force lazy images to load
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 500));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) issues.push(`${label} ${route}: horizontal overflow ${overflow}px`);
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
    if (broken.length) issues.push(`${label} ${route}: broken images ${broken.join(', ')}`);
    const buf = await page.screenshot({ fullPage: true, type: 'png' });
    const meta = await sharp(buf).metadata();
    const tileH = label === 'desk' ? 1800 : 2400;
    const slug = route.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home';
    for (let i = 0, top = 0; top < meta.height; i++, top += tileH) {
      const h = Math.min(tileH, meta.height - top);
      await sharp(buf).extract({ left: 0, top, width: meta.width, height: h }).resize({ width: label === 'desk' ? 1000 : 390 }).jpeg({ quality: 70 }).toFile(join(out, `${slug}-${label}-${String(i).padStart(2, '0')}.jpg`));
    }
    console.log(`${label} ${route} ${meta.width}x${meta.height}`);
  }
  await page.close();
}
console.log(issues.length ? `ISSUES:\n${issues.join('\n')}` : 'No console errors, overflow or broken images.');
await browser.close().catch(() => {});
