// Site behavior. Vanilla, no framework. Everything degrades: links still work,
// FAQ uses native <details>, gallery shows all tiles without JS.

type Tracking = { ga4: string; ads: string; adsFormLabel: string; adsCallLabel: string };
declare global {
  interface Window { __MP_TRACKING?: Tracking; dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
}

const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid'];

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
  if (!safeSession(() => sessionStorage.getItem('mp_ref'), null)) {
    safeSession(() => sessionStorage.setItem('mp_ref', document.referrer || 'direct'), undefined);
  }
}

function attribution(): Record<string, string> {
  return safeSession(() => JSON.parse(sessionStorage.getItem('mp_attr') || '{}'), {});
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
function sendLeadConversions(phone: string, service: string, done: () => void) {
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
    // Enhanced conversions for leads: Google hashes this before sending.
    if (e164) gtag('set', 'user_data', { phone_number: e164 });
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

function initForms() {
  document.querySelectorAll<HTMLFormElement>('[data-lead-form]').forEach((form) => {
    const err = form.querySelector<HTMLElement>('.err');
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      if (String(fd.get('company_website') || '')) return; // honeypot
      const name = String(fd.get('name') || '').trim();
      const phone = String(fd.get('phone') || '').trim();
      const nameEl = form.elements.namedItem('name') as HTMLInputElement;
      const phoneEl = form.elements.namedItem('phone') as HTMLInputElement;
      nameEl.removeAttribute('aria-invalid'); phoneEl.removeAttribute('aria-invalid');
      const d = digits(phone);
      if (name.length < 2) { nameEl.setAttribute('aria-invalid', 'true'); if (err) err.textContent = 'Please add your name.'; nameEl.focus(); return; }
      if (d.length < 10 || d.length > 11) { phoneEl.setAttribute('aria-invalid', 'true'); if (err) err.textContent = 'Please add a 10-digit phone number so we can call you back.'; phoneEl.focus(); return; }
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
        if (btn) { btn.disabled = false; btn.textContent = 'Request My Free Estimate →'; }
        if (err) err.innerHTML = 'Something went wrong sending your request. Please call <a href="tel:+13237124699">(323) 712-4699</a>.';
        return;
      }

      safeSession(() => sessionStorage.setItem('mp_lead_first', name.split(/\s+/)[0]), undefined);
      sendLeadConversions(phone, String(fd.get('service') || ''), () => { location.href = '/thank-you/'; });
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
