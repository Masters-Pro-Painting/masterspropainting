import type { JobService } from './types';
import { STAGING } from './site';
import { REVIEWS } from './reviews';

// Recent jobs shown on the interior, exterior and cabinet pages.
// Only real jobs Vlad confirmed: city only, never the street, and every photo
// must come from that exact job (the city pages promise nothing is made up).
// Photo ids are files in src/assets/photos/*-NNN.jpg, alt text in photos.ts.
// A real job replaces that page's photo grid (grid has hideWhenJobs).

export interface Job {
  service: JobService;
  city: string; // city or neighborhood only, never the street
  region?: string; // e.g. 'Los Angeles' for an LA neighborhood
  did: string; // what was painted + when, from Vlad
  month: string; // when it was finished, e.g. 'September 2026'
  photos: string[]; // 1 to 3 photo ids from this job, in display order
  review?: string; // REVIEWS key, only if this customer left that review
  quote?: string; // exact words from that review to show (no em dash)
  preview?: true; // layout placeholder, staging only
}

export const JOBS: Job[] = [
  {
    service: 'Exterior Painting',
    city: 'La Cañada Flintridge', // Vlad's first note said Los Feliz; Adam confirmed La Cañada Flintridge 14 Oct.
    did: 'Full exterior repaint of the house and garage, siding and trim included. Started September 14, finished September 25.',
    month: 'September 2026',
    photos: ['114', '115', '116'],
  },
  {
    service: 'Interior Painting',
    city: 'Tujunga',
    did: 'Interior painting, wall repairs and a limewash finish. Started March 2, finished March 10.',
    month: 'March 2026',
    photos: ['117', '118', '119'],
    review: 'max',
    quote: 'They did a great job prepping surfaces, were super considerate and delicate with my belongings, and performed a gorgeous lime wash.',
  },
  {
    service: 'Cabinet Painting',
    city: 'Burbank',
    did: 'Kitchen cabinets and island painted white. Started February 9, finished February 18.',
    month: 'February 2026', // year confirmed by Adam 14 Oct
    photos: ['120', '121', '122'],
    review: 'karla',
    quote: 'Vladimir is incredibly responsible, arrived on time, and showed up with a team that was truly professional, respectful, and honest.',
  },
];

// Layout preview for staging, per service with no real job yet. Reuses photos
// already on that page. Never rendered on the live site.
const PREVIEW: Job[] = [
  { service: 'Interior Painting', city: '[City from Vlad]', did: '[One line from Vlad: what was painted, e.g. walls, ceilings and trim in a 3-bedroom home]', month: '[Month]', photos: ['004', '005', '113'], preview: true },
  { service: 'Exterior Painting', city: '[City from Vlad]', did: '[One line from Vlad: e.g. full exterior, stucco and trim, single story]', month: '[Month]', photos: ['014', '104'], preview: true },
  { service: 'Cabinet Painting', city: '[City from Vlad]', did: '[One line from Vlad: e.g. kitchen cabinets and island, sprayed white]', month: '[Month]', photos: ['045'], preview: true },
];

for (const j of JOBS) {
  const where = `jobs.ts: ${j.service} in ${j.city}`;
  if (j.preview) throw new Error(`${where} is a preview job inside JOBS`);
  if (!j.photos.length || j.photos.length > 3) throw new Error(`${where} needs 1 to 3 photos`);
  if (/\d/.test(j.city)) throw new Error(`${where}: looks like an address. City only.`);
  if (j.quote && !j.review) throw new Error(`${where}: quote without a review key`);
  if (j.review && !REVIEWS[j.review]) throw new Error(`${where}: review ${j.review} missing`);
  if (j.quote && !REVIEWS[j.review!].text.includes(j.quote)) throw new Error(`${where}: quote is not word for word from the review`);
  if (j.quote?.includes('—')) throw new Error(`${where}: quote has an em dash`);
}

export const hasRealJobs = (service: JobService) => JOBS.some((j) => j.service === service);

export const jobsFor = (service: JobService): Job[] => {
  const real = JOBS.filter((j) => j.service === service);
  return real.length || !STAGING ? real : PREVIEW.filter((j) => j.service === service);
};
