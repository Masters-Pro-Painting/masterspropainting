// Single source of truth for business facts shown on the site.

// Set in netlify.toml. STAGING = noindex everything until the domain points here.
export const STAGING = import.meta.env.PUBLIC_STAGING !== 'false';

// Google tracking IDs (public values). Empty = that tracking is off.
export const TRACKING = {
  ga4: (import.meta.env.PUBLIC_GA4_ID ?? '').trim(),
  ads: (import.meta.env.PUBLIC_ADS_ID ?? '').trim(),
  adsFormLabel: (import.meta.env.PUBLIC_ADS_FORM_LABEL ?? '').trim(),
  adsCallLabel: (import.meta.env.PUBLIC_ADS_CALL_LABEL ?? '').trim(),
};

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
