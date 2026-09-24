// Runs after every build (npm run build). Zapier finds the lead form by its Netlify
// form name and maps each field by name. If the name or a field changes, the Zap
// breaks silently, so this fails the build instead and the live site stays as it was.
// Changing the form on purpose? Update CONTRACT below, deploy, then remap the Zap.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = process.argv[2] || 'dist';
const CONTRACT = {
  name: 'estimate',
  fields: [
    'form-name', 'page_url', 'page_title', 'referrer', 'landing_page',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'gclid', 'gbraid', 'wbraid', 'fbclid', 'submitted_at',
    'name', 'phone', 'city', 'service', 'company_website',
  ],
};

const pages = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f.endsWith('.html')) pages.push(p); } };
walk(DIST);

const problems = [];
let formsSeen = 0;
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const [, attrs, body] of html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/g)) {
    formsSeen++;
    const where = page.slice(DIST.length + 1);
    const name = (attrs.match(/\bname="([^"]*)"/) || [])[1];
    if (name !== CONTRACT.name) problems.push(`${where}: form name is "${name}", expected "${CONTRACT.name}"`);
    if (!/\bdata-netlify="true"/.test(attrs)) problems.push(`${where}: form lost data-netlify="true"`);
    const formName = (body.match(/<input[^>]*name="form-name"[^>]*value="([^"]*)"/) || [])[1];
    if (formName !== CONTRACT.name) problems.push(`${where}: hidden form-name is "${formName}"`);
    const fields = [...new Set([...body.matchAll(/<(?:input|select|textarea)\b[^>]*\bname="([^"]+)"/g)].map((m) => m[1]))];
    const missing = CONTRACT.fields.filter((f) => !fields.includes(f));
    const extra = fields.filter((f) => !CONTRACT.fields.includes(f));
    if (missing.length) problems.push(`${where}: fields missing: ${missing.join(', ')}`);
    if (extra.length) problems.push(`${where}: new fields: ${extra.join(', ')}`);
  }
}
if (!formsSeen) problems.push('no lead form found in any built page');

if (problems.length) {
  console.error('\nFORM CONTRACT FAILED. Zapier maps these names, so this build is stopped.\n');
  for (const p of problems.slice(0, 20)) console.error('  - ' + p);
  console.error('\nIf this change is deliberate: update CONTRACT in scripts/form-contract.mjs, then remap the Zap.\n');
  process.exit(1);
}
console.log(`form contract OK: ${formsSeen} "${CONTRACT.name}" forms, ${CONTRACT.fields.length} fields each`);
