// Site behavior. Vanilla, no framework. Everything degrades: links still work,
// FAQ uses native <details>, gallery shows all tiles without JS.

type Tracking = { ga4: string; ads: string; adsFormLabel: string; adsCallLabel: string };
declare global {
  interface Window { __MP_TRACKING?: Tracking; __MP_PHONE?: { tel: string; label: string }; dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
}

const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
// Google click IDs are kept for 90 days (Google's own click window), so a visitor who
// comes back later, or in a new tab, still sends them with the lead.
const CLICK_KEYS = ['gclid', 'gbraid', 'wbraid'];
const CLICK_TTL_MS = 90 * 24 * 60 * 60 * 1000;

function safeSession<T>(fn: () => T, fallback: T): T {
  try { return fn(); } catch { return fallback; }
}

function captureAttribution() {
  const params = new URLSearchParams(location.search);
  const found: Record<string, string> = {};
  for (const k of ATTR_KEYS) { const v = params.get(k); if (v) found[k] = v; }
  if (Object.keys(found).length) {
    safeSession(() => sessionStorage.setItem('mp_attr', JSON.stringify({ ...found, landing_page: location.pathname })), undefined);
  }
  for (const k of CLICK_KEYS) {
    if (found[k]) safeSession(() => localStorage.setItem(`mp_${k}`, JSON.stringify({ v: found[k], t: Date.now() })), undefined);
  }
  if (!safeSession(() => sessionStorage.getItem('mp_ref'), null)) {
    safeSession(() => sessionStorage.setItem('mp_ref', document.referrer || 'direct'), undefined);
  }
}

function storedClickId(k: string): string {
  return safeSession(() => {
    const saved = JSON.parse(localStorage.getItem(`mp_${k}`) || 'null');
    if (!saved || !saved.v) return '';
    if (Date.now() - Number(saved.t) > CLICK_TTL_MS) { localStorage.removeItem(`mp_${k}`); return ''; }
    return String(saved.v);
  }, '');
}

function attribution(): Record<string, string> {
  const attr: Record<string, string> = safeSession(() => JSON.parse(sessionStorage.getItem('mp_attr') || '{}'), {});
  for (const k of CLICK_KEYS) {
    if (!attr[k]) { const v = storedClickId(k); if (v) attr[k] = v; }
  }
  return attr;
}

function initMenu() {
  const burger = document.querySelector<HTMLButtonElement>('[data-burger]');
  const menu = document.getElementById('mobile-menu');
  if (!burger || !menu) return;
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  menu.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
  document.querySelectorAll<HTMLElement>('.dd > button').forEach((b) => {
    b.addEventListener('click', () => b.parentElement?.classList.toggle('open'));
  });
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.dd.open').forEach((dd) => { if (!dd.contains(e.target as Node)) dd.classList.remove('open'); });
  });
}

function initFaq() {
  document.querySelectorAll<HTMLElement>('[data-faq]').forEach((group) => {
    const items = Array.from(group.querySelectorAll('details'));
    items.forEach((d) => d.addEventListener('toggle', () => {
      if (d.open) items.forEach((o) => { if (o !== d) o.open = false; });
    }));
  });
}

function initGallery() {
  document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((wrap) => {
    const buttons = Array.from(wrap.querySelectorAll<HTMLButtonElement>('[data-filter]'));
    const tiles = Array.from(wrap.querySelectorAll<HTMLElement>('[data-cat]'));
    const apply = (cat: string) => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));
      let shown = 0;
      tiles.forEach((t) => {
        const show = cat === 'All' ? shown < 8 : t.dataset.cat === cat;
        t.hidden = !show;
        if (show) shown++;
      });
    };
    buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter || 'All')));
    apply('All');
  });
}

const digits = (s: string) => s.replace(/\D/g, '');

function tracking(): Tracking {
  return window.__MP_TRACKING || { ga4: '', ads: '', adsFormLabel: '', adsCallLabel: '' };
}

function toE164(raw: string): string {
  const d = digits(raw);
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;
  return '';
}

// Sends the GA4 lead event and the Google Ads form conversion, then calls done().
// done() always runs, even if Google is blocked or slow (1.2s cap).
function sendLeadConversions(phone: string, email: string, service: string, done: () => void) {
  const t = tracking();
  const gtag = window.gtag;
  let finished = false;
  const finish = () => { if (!finished) { finished = true; done(); } };
  if (!gtag || (!t.ga4 && !(t.ads && t.adsFormLabel))) { finish(); return; }

  let pending = 0;
  const one = () => { pending -= 1; if (pending <= 0) finish(); };
  const e164 = toE164(phone);
  const txId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (t.ads && t.adsFormLabel) {
    pending += 1;
    // Enhanced conversions for leads: Google hashes these before sending.
    // Email on its own qualifies; phone alone does not.
    const userData: Record<string, string> = {};
    if (email) userData.email = email.trim().toLowerCase();
    if (e164) userData.phone_number = e164;
    if (Object.keys(userData).length) gtag('set', 'user_data', userData);
    gtag('event', 'conversion', { send_to: `${t.ads}/${t.adsFormLabel}`, transaction_id: txId, event_callback: one });
  }
  if (t.ga4) {
    pending += 1;
    gtag('event', 'generate_lead', { send_to: t.ga4, form_service: service || 'unspecified', form_page: location.pathname, event_callback: one });
  }
  setTimeout(finish, 1200);
}

function fillTrackingFields(form: HTMLFormElement) {
  const attr = attribution();
  const values: Record<string, string> = {
    page_url: location.href,
    page_title: document.title,
    referrer: safeSession(() => sessionStorage.getItem('mp_ref'), '') || '',
    submitted_at: new Date().toISOString(),
    ...attr,
  };
  form.querySelectorAll<HTMLInputElement>('input[data-track]').forEach((input) => {
    input.value = values[input.dataset.track || ''] || '';
  });
}

// "Something went wrong, call us." Uses the number showing on the page right now, so an
// ad visitor is given Google's forwarding number and the call still counts.
function showCallFallback(err: HTMLElement | null) {
  if (!err) return;
  const phone = window.__MP_PHONE || { tel: 'tel:+13237124699', label: '(323) 712-4699' };
  const a = document.createElement('a');
  a.href = phone.tel;
  a.textContent = phone.label;
  err.textContent = 'Something went wrong sending your request. Please call ';
  err.append(a, '.');
}

function initForms() {
  document.querySelectorAll<HTMLFormElement>('[data-lead-form]').forEach((form) => {
    const err = form.querySelector<HTMLElement>('.err');
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const btnLabel = btn?.textContent || 'Request My Free Estimate →';
    // Back from the thank-you page restores this page from cache with the button still
    // on "Sending…". Put it back so the visitor can correct and resend.
    window.addEventListener('pageshow', (e) => {
      if (e.persisted && btn) { btn.disabled = false; btn.textContent = btnLabel; }
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      // Spam trap. A browser autofill can fill it for a real person, so say something
      // instead of failing silently. Nothing is sent and no conversion fires.
      if (String(fd.get('company_website') || '')) { showCallFallback(err); return; }
      const name = String(fd.get('name') || '').trim();
      const phone = String(fd.get('phone') || '').trim();
      const email = String(fd.get('email') || '').trim();
      const nameEl = form.elements.namedItem('name') as HTMLInputElement;
      const phoneEl = form.elements.namedItem('phone') as HTMLInputElement;
      const emailEl = form.elements.namedItem('email') as HTMLInputElement;
      nameEl.removeAttribute('aria-invalid'); phoneEl.removeAttribute('aria-invalid'); emailEl.removeAttribute('aria-invalid');
      const d = digits(phone);
      if (name.length < 2) { nameEl.setAttribute('aria-invalid', 'true'); if (err) err.textContent = 'Please add your name.'; nameEl.focus(); return; }
      if (d.length < 10 || d.length > 11) { phoneEl.setAttribute('aria-invalid', 'true'); if (err) err.textContent = 'Please add a 10-digit phone number so we can call you back.'; phoneEl.focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { emailEl.setAttribute('aria-invalid', 'true'); if (err) err.textContent = 'Please add your email so we can send your estimate.'; emailEl.focus(); return; }
      if (err) err.textContent = '';

      fillTrackingFields(form);
      const body = new URLSearchParams();
      new FormData(form).forEach((v, k) => body.append(k, String(v)));

      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      let ok = false;
      try {
        // Netlify Forms: URL-encoded POST with form-name. JSON is not supported.
        const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
        ok = res.ok;
      } catch { ok = false; }

      if (!ok) {
        if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
        showCallFallback(err);
        return;
      }

      safeSession(() => sessionStorage.setItem('mp_lead_first', name.split(/\s+/)[0]), undefined);
      const go = () => { location.href = '/thank-you/'; };
      // One conversion per visit. Someone who goes Back and resends a correction still
      // reaches Netlify and the CRM, but is not counted as a second lead.
      if (safeSession(() => sessionStorage.getItem('mp_lead_sent'), null) === '1') { go(); return; }
      safeSession(() => sessionStorage.setItem('mp_lead_sent', '1'), undefined);
      sendLeadConversions(phone, email, String(fd.get('service') || ''), go);
    });
  });
}

// Every tap on a phone link goes to GA4 as click_to_call. It is NOT a Google Ads
// conversion: a tap is not a call. Real calls are counted by the call conversions.
function initCallClicks() {
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="tel:"]');
    if (!a) return;
    const t = tracking();
    if (window.gtag && t.ga4) {
      window.gtag('event', 'click_to_call', { send_to: t.ga4, link_url: a.getAttribute('href'), page_path: location.pathname, transport_type: 'beacon' });
    }
  });
}

function initServiceSwap() {
  const el = document.querySelector<HTMLElement>('[data-service-swap]');
  if (!el) return;
  const key = new URLSearchParams(location.search).get('service');
  if (!key) return;
  const map = JSON.parse(el.dataset.serviceSwap || '{}') as Record<string, { h1: string; lede: string; option: string }>;
  const v = map[key.toLowerCase()];
  if (!v) return;
  const h1 = document.querySelector('h1');
  const lede = document.querySelector<HTMLElement>('[data-lede]');
  if (h1) h1.textContent = v.h1;
  if (lede) lede.textContent = v.lede;
  document.querySelectorAll<HTMLSelectElement>('select[name="service"]').forEach((s) => { s.value = v.option; });
}

function initThankYou() {
  const el = document.querySelector<HTMLElement>('[data-first-name]');
  if (!el) return;
  const first = safeSession(() => sessionStorage.getItem('mp_lead_first'), null);
  if (first) el.textContent = `, ${first}`;
}

function fixEstimateAnchors() {
  if (document.getElementById('estimate')) return;
  document.querySelectorAll<HTMLAnchorElement>('a[href="#estimate"]').forEach((a) => { a.href = '/#estimate'; });
}

export function initSite() {
  fixEstimateAnchors();
  captureAttribution();
  initMenu();
  initFaq();
  initGallery();
  initForms();
  initCallClicks();
  initServiceSwap();
  initThankYou();
}
