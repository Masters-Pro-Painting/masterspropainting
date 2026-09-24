import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
// Needs puppeteer-core: set PUPPETEER_CORE to its path, or `npm i -D puppeteer-core`.
const puppeteer = require(process.env.PUPPETEER_CORE || 'puppeteer-core');
const routes = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: (process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'), headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
let bad = 0;
for (const w of [375, 390, 768]) {
  await page.setViewport({ width: w, height: 800 });
  for (const r of routes) {
    await page.goto('http://localhost:4322' + r, { waitUntil: 'networkidle0' });
    const off = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth; const out = [];
      document.querySelectorAll('main *, header *, footer *').forEach((el) => {
        const cs = getComputedStyle(el); if (cs.position === 'fixed' || cs.display === 'none') return;
        if (el.closest('.hp, .sr-only, .mobile-menu, .dd-menu')) return;
        const rc = el.getBoundingClientRect(); if (rc.width && (rc.right > vw + 1 || rc.left < -1)) out.push(`${el.tagName.toLowerCase()}.${el.className}`.slice(0, 60) + ` r=${Math.round(rc.right)}`);
      });
      return [...new Set(out)].slice(0, 5);
    });
    if (off.length) { bad++; console.log(w, r, off); }
  }
}
console.log(bad ? `${bad} page/width combos overflow` : 'No element overflow at 375/390/768');
await browser.close().catch(() => {});
