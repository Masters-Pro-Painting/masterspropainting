// Build the site exactly as netlify.toml says, check it, then publish it to Netlify.
//   npm run deploy               -> private draft (own URL, live site untouched)
//   npm run deploy -- --publish  -> goes live
// A draft is the same build as live. Tracking only runs on the real domain, so opening or
// testing a draft link sends nothing to GA4 or Google Ads.
// Needs a Netlify personal access token in .env.vlad (NETLIFY_AUTH_TOKEN=..., never committed).
// Not needed once the repo is linked in Netlify: then a push to main publishes by itself.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE_ID = '1debc503-fffd-4241-b340-27991a7a9377'; // Netlify project "masterspropainting"
const PUBLISH = process.argv.includes('--publish');
const fail = (msg) => { console.error(`\nSTOPPED: ${msg}\n`); process.exit(1); };

// 1. token
let TOKEN = process.env.NETLIFY_AUTH_TOKEN || '';
if (!TOKEN) {
  try { TOKEN = (readFileSync(join(ROOT, '.env.vlad'), 'utf8').split(/\r?\n/).find((l) => l.startsWith('NETLIFY_AUTH_TOKEN=')) || '').slice(19).trim().replace(/^["']|["']$/g, ''); } catch { /* no file */ }
}
if (!TOKEN) fail('no Netlify token. Put NETLIFY_AUTH_TOKEN=... in .env.vlad');

// 2. build settings straight from netlify.toml, so this build equals a Netlify build
const toml = readFileSync(join(ROOT, 'netlify.toml'), 'utf8');
const block = (toml.split('[build.environment]')[1] || '').split(/\r?\n\[/)[0];
const env = {};
for (const m of block.matchAll(/^\s*([A-Z0-9_]+)\s*=\s*["']([^"']*)["']/gm)) env[m[1]] = m[2];
const NEED = ['PUBLIC_STAGING', 'PUBLIC_GA4_ID', 'PUBLIC_ADS_ID', 'PUBLIC_ADS_FORM_LABEL', 'PUBLIC_ADS_CALL_LABEL'];
const missing = NEED.filter((k) => !(k in env));
if (missing.length) fail(`netlify.toml [build.environment] is missing: ${missing.join(', ')}`);

// 3. only committed code goes out
const head = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
const dirty = execSync('git status --porcelain', { cwd: ROOT }).toString().trim();
if (dirty) fail(`uncommitted changes. Commit first, so what is live matches GitHub:\n${dirty}`);

execSync('npm run build', { cwd: ROOT, stdio: 'inherit', env: { ...process.env, ...env } });

// 4. the build must carry tracking and be visible to Google. A draft gets the same checks,
//    because a draft can be published later with one click in Netlify.
const DIST = join(ROOT, 'dist');
const home = readFileSync(join(DIST, 'index.html'), 'utf8');
if (env.PUBLIC_STAGING !== 'false') {
  if (PUBLISH && !process.argv.includes('--allow-staging-live')) {
    fail(`PUBLIC_STAGING is "${env.PUBLIC_STAGING}" in netlify.toml, not "false". That build is hidden from Google, so it will not be published live. Set it to "false", or add --allow-staging-live if you really mean it.`);
  }
  console.log('note: this is a STAGING build (hidden from Google). Do not publish it from the Netlify screen.');
} else {
  // Same clean-up the site does in src/data/site.ts, so "123456789" or "AW-123/label" still match.
  const must = {
    'GA4 ID': [env.PUBLIC_GA4_ID, (v) => (v.match(/\bG-[A-Z0-9]{6,}\b/i) || [''])[0].toUpperCase()],
    'Google Ads ID': [env.PUBLIC_ADS_ID, (v) => { const m = v.trim().match(/^(?:AW-)?(\d{6,})/i); return m ? `AW-${m[1]}` : ''; }],
    'form conversion label': [env.PUBLIC_ADS_FORM_LABEL, (v) => v.trim().replace(/^AW-\d+\//i, '')],
    'call conversion label': [env.PUBLIC_ADS_CALL_LABEL, (v) => v.trim().replace(/^AW-\d+\//i, '')],
  };
  for (const [what, [value, clean]] of Object.entries(must)) {
    if (!value) fail(`${what} is empty in netlify.toml. A live build would ship with that tracking off.`);
    if (!clean(value) || !home.includes(clean(value))) fail(`${what} (${value}) is not in the built home page.`);
  }
  if (!home.includes('content="index, follow')) fail('the built home page is not "index, follow". Google would be blocked.');
  if (!home.includes('data-netlify="true"')) fail('the built home page has no Netlify form.');
}

// 5. upload (Netlify only asks for files it does not already have)
const api = async (path, opts = {}) => {
  const res = await fetch(`https://api.netlify.com/api/v1${path}`, { ...opts, headers: { Authorization: `Bearer ${TOKEN}`, ...(opts.headers || {}) } });
  if (!res.ok) throw new Error(`${opts.method || 'GET'} ${path} -> ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
};
const files = {}; const buf = {};
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const full = join(d, f);
    if (statSync(full).isDirectory()) { walk(full); continue; }
    const key = '/' + relative(DIST, full).split('\\').join('/');
    const b = readFileSync(full);
    files[key] = createHash('sha1').update(b).digest('hex'); buf[key] = b;
  }
};
walk(DIST);
const deploy = await api(`/sites/${SITE_ID}/deploys`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ files, draft: !PUBLISH, title: `GitHub ${head}${PUBLISH ? '' : ' (draft)'}` }) });
const need = new Set(deploy.required || []); let sent = 0;
for (const [key, sha] of Object.entries(files)) {
  if (!need.has(sha)) continue; need.delete(sha);
  await api(`/deploys/${deploy.id}/files${encodeURI(key)}`, { method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: buf[key] });
  sent += 1;
}
console.log(`commit ${head} | ${Object.keys(files).length} files | ${sent} uploaded`);
for (let i = 0; i < 90; i += 1) {
  const d = await api(`/deploys/${deploy.id}`);
  if (d.state === 'ready') { console.log(`${PUBLISH ? 'LIVE' : 'DRAFT'} ready: ${d.deploy_ssl_url}`); process.exit(0); }
  if (d.state === 'error') fail(`Netlify reported: ${d.error_message}`);
  await new Promise((r) => setTimeout(r, 2000));
}
fail('timed out waiting for Netlify');
