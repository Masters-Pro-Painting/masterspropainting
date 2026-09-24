export type HeroData = {
  variant: 'split' | 'split-left' | 'banner' | 'stacked';
  kicker: string;
  h1: string;
  lede: string;
  bullets: string[];
  photo: string;
  formTitle?: string;
  service?: string;
  proofMeta?: string;
};

export type LinkItem = { href: string; t: string; d?: string };
export type QA = { q: string; a: string };

export type Section =
  | { type: 'split'; kicker: string; h2: string; paras: string[]; photo: string; reverse?: boolean; bg?: 'alt'; cta?: string }
  | { type: 'checklist'; kicker: string; h2: string; intro?: string; items: string[]; photo: string; reverse?: boolean; bg?: 'alt' }
  | { type: 'price'; kicker: string; h2: string; range?: string; unit?: string; pending?: string; factors: string[]; note: string; bg?: 'alt' }
  | { type: 'prices'; kicker: string; h2: string; intro: string; bg?: 'alt' }
  | { type: 'grid'; kicker: string; h2: string; intro?: string; tiles: { photo: string; label: string }[]; bg?: 'alt' }
  | { type: 'steps'; kicker: string; h2: string; steps: { t: string; b: string }[]; bg?: 'alt' }
  | { type: 'reviews'; kicker: string; h2: string; keys: string[]; bg?: 'alt' }
  | { type: 'pullquote'; key: string; kicker?: string }
  | { type: 'guarantee'; photo: string; h2?: string; body?: string; note?: string }
  | { type: 'faq'; kicker?: string; h2: string; intro: string; items: QA[] }
  | { type: 'poster'; kicker: string; h2: string; body: string; photo?: string }
  | { type: 'links'; kicker: string; h2: string; intro?: string; links: LinkItem[]; bg?: 'alt' }
  | { type: 'stats' }
  | { type: 'trust' };

export type PageData = {
  slug: string;
  name: string;
  title: string;
  description: string;
  hero: HeroData;
  sections: Section[];
};

export function photosOf(page: PageData): string[] {
  const ids: string[] = [page.hero.photo];
  for (const s of page.sections) {
    if ('photo' in s && s.photo) ids.push(s.photo);
    if (s.type === 'grid') ids.push(...s.tiles.map((t) => t.photo));
  }
  return ids;
}

export function faqOf(page: PageData): QA[] {
  return page.sections.flatMap((s) => (s.type === 'faq' ? s.items : []));
}

export const stripTags = (html: string) => html.replace(/<[^>]+>/g, '');
