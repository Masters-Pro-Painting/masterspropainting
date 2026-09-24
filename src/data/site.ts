// Single source of truth for business facts shown on the site.

// Set in netlify.toml. STAGING = noindex everything until the domain points here.
export const STAGING = import.meta.env.PUBLIC_STAGING !== 'false';

// Google tracking IDs (public values), set in netlify.toml. Empty = that tracking is off.
// Accepts the values however Google shows them: "123456789" or "AW-123456789" for the
// Ads ID, "AbC123" or the whole "AW-123456789/AbC123" for a label. A value that can't be
// read fails the build, so Netlify keeps the last good version live.
const raw = (v: string | undefined) => (v ?? '').trim().replace(/^['"]+|['"]+$/g, '').trim();
function readId(name: string, value: string, pattern: RegExp, format: (m: RegExpMatchArray) => string) {
  if (!value) return '';
  const m = value.match(pattern);
  if (!m) throw new Error(`netlify.toml ${name} = "${value}" doesn't look right. Check the value Google gave you.`);
  return format(m);
}
const ga4 = readId('PUBLIC_GA4_ID', raw(import.meta.env.PUBLIC_GA4_ID), /\bG-[A-Z0-9]{6,}\b/i, (m) => m[0].toUpperCase());
const ads = readId('PUBLIC_ADS_ID', raw(import.meta.env.PUBLIC_ADS_ID), /^(?:AW-)?(\d{6,})(?:\/.*)?$/i, (m) => `AW-${m[1]}`);
const LABEL = /^(?:AW-\d+\/)?([A-Za-z0-9_-]{6,})$/i;
const adsFormLabel = readId('PUBLIC_ADS_FORM_LABEL', raw(import.meta.env.PUBLIC_ADS_FORM_LABEL), LABEL, (m) => m[1]);
const adsCallLabel = readId('PUBLIC_ADS_CALL_LABEL', raw(import.meta.env.PUBLIC_ADS_CALL_LABEL), LABEL, (m) => m[1]);
if ((adsFormLabel || adsCallLabel) && !ads) throw new Error('netlify.toml has a Google Ads label but PUBLIC_ADS_ID is empty.');

export const TRACKING = { ga4, ads, adsFormLabel, adsCallLabel };

// Netlify Forms form name. Zapier and the Netlify dashboard look for this exact name.
export const FORM_NAME = 'estimate';

export const SITE = {
  name: "Master's Pro Painting Inc",
  short: "Master's Pro Painting",
  url: 'https://masterspropaintinginc.company',
  owner: 'Vladimir Rivera',
  phone: '(323) 712-4699',
  tel: 'tel:+13237124699',
  phoneE164: '+1-323-712-4699',
  email: 'info@masterspropaintinginc.company',
  street: '6470 Foothill Blvd Unit E',
  city: 'Tujunga',
  region: 'CA',
  zip: '91042',
  addressLine: '6470 Foothill Blvd Unit E, Tujunga, CA 91042',
  mapsUrl: 'https://maps.google.com/?cid=13484825045435717212',
  // Google Business Profile, read 2026-09-16. Design file said 6pm. GBP says 5pm.
  hours: 'Mon to Sat 7am to 5pm',
  hoursSchema: 'Mo-Sa 07:00-17:00',
  license: '1140485',
  licenseClass: 'C-33 Painting and Decorating',
  years: '11+',
  rating: '5.0',
  reviewCount: 30,
  guaranteeYears: 7,
  payments: ['Cash', 'Check', 'Zelle'],
} as const;

// Public profiles.
export const PROFILES = {
  gbp: 'https://maps.google.com/?cid=13484825045435717212',
  yelp: 'https://www.yelp.com/biz/masters-pro-painting-inc-tujunga',
  facebook: 'https://www.facebook.com/MastersProPaintingInc',
  instagram: 'https://www.instagram.com/masterspropaintinginc/',
  youtube: 'https://www.youtube.com/@MastersProPaintingInc',
  // Local Services profile link. Empty = the Google Verified badge shows without a link.
  googleVerified: '',
  // PCA member profile URL, if one exists. Otherwise the PCA home page.
  pca: 'https://www.pcapainted.org/',
} as const;

export const PRICES = {
  interior: { low: '$3.75', high: '$9.25', unit: 'per sq ft' },
  exterior: { low: '$4.25', high: '$10.50', unit: 'per sq ft' },
} as const;

export const NAV_SERVICES = [
  { href: '/interior-painting/', label: 'Interior Painting' },
  { href: '/exterior-painting/', label: 'Exterior Painting' },
  { href: '/cabinet-painting/', label: 'Cabinet Painting' },
  { href: '/commercial-painting/', label: 'Commercial Painting' },
  { href: '/staining-wood-refinishing/', label: 'Staining & Wood Refinishing' },
  { href: '/epoxy-flooring/', label: 'Epoxy Garage Floors' },
  { href: '/drywall-repair/', label: 'Drywall Repair' },
] as const;

export const SERVICE_OPTIONS = [
  'Interior Painting',
  'Exterior Painting',
  'Cabinet Painting',
  'Commercial Painting',
  'Staining & Wood Refinishing',
  'Epoxy Garage Floor',
  'Drywall Repair',
  'Other',
] as const;
