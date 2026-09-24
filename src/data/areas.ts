import type { PageData, Section, HeroData, LinkItem, QA } from './types';
import { SITE, PRICES } from './site';
import { AREA_INDEX, areaHref } from './area-index';

// Service area pages. Local copy uses general, well-known facts about each
// community (neighborhood names, ZIPs, housing style, climate). No invented
// job locations: photos are captioned by subject only, never by city.

type Template = 'A' | 'B' | 'C' | 'D';

type AreaInput = {
  slug: string;
  city: string;
  template: Template;
  title: string;
  description: string;
  hero: Omit<HeroData, 'variant'>;
  intro: { kicker: string; h2: string; paras: string[]; photo: string };
  services: LinkItem[];
  grid: { h2: string; intro?: string; tiles: { photo: string; label: string }[] };
  tips: { kicker: string; h2: string; intro?: string; items: string[]; photo: string };
  reviews?: { h2: string; keys: string[] };
  pullquote?: { key: string; kicker: string };
  faq: QA[];
  poster: { kicker: string; h2: string; body: string; photo: string };
  nearby: string[];
};

const HERO_VARIANT: Record<Template, HeroData['variant']> = { A: 'split', B: 'banner', C: 'stacked', D: 'split-left' };

const costQA = (city: string, tail: string): QA => ({
  q: `How much does it cost to paint a house in ${city}?`,
  a: `Interior painting runs ${PRICES.interior.low} to ${PRICES.interior.high} per square foot. Exterior painting runs ${PRICES.exterior.low} to ${PRICES.exterior.high} per square foot. Cabinets, staining, epoxy and drywall repair are quoted per project. ${tail}`,
});

const VARIANTS: Record<Template, { grid: string; prices: (c: string) => string; faq: (c: string) => string; nearby: string; costTail: (c: string) => string }> = {
  A: { grid: "Real Master's Pro jobs. Captioned by what you see, not by city, because we don't make that part up.", prices: (c) => `The same honest ranges we quote everywhere. Your ${c} price comes in writing after a free walkthrough.`, faq: (c) => `Straight answers for ${c} homeowners. Don't see your question? Call us. A real person answers.`, nearby: "Close to home, and close to you.", costTail: (c) => `Every ${c} job gets a written quote after a free walkthrough.` },
  B: { grid: "No stock photos. These are real jobs by our crew, labeled by the work, not the neighborhood.", prices: (c) => `Real numbers before you book. Your exact ${c} price depends on prep, height and detail, and it comes in writing.`, faq: (c) => `What ${c} property owners ask before they hire a painter.`, nearby: "More communities we cover from our Tujunga shop.", costTail: (c) => `We measure your ${c} property on a free visit and put the number in writing.` },
  C: { grid: "Photos from actual Master's Pro projects. We skip the city labels so nothing on this page is made up.", prices: (c) => `Ranges first, so you can budget. Then a free ${c} walkthrough and one written price.`, faq: (c) => `Quick answers before you book a ${c} estimate.`, nearby: "Neighboring areas on our regular routes.", costTail: (c) => `You get the exact ${c} figure in writing after we see the job.` },
  D: { grid: "Every tile is a real Master's Pro job, captioned by the surface we painted.", prices: (c) => `Know the range before we visit. Your ${c} quote is free, written and itemized.`, faq: (c) => `The questions ${c} clients ask us most, answered plainly.`, nearby: "Other areas we paint across Los Angeles County.", costTail: (c) => `Your ${c} quote is free and in writing.` },
};

function build(a: AreaInput): PageData {
  const v = VARIANTS[a.template];
  const s = {
    trust: { type: 'trust' } as Section,
    stats: { type: 'stats' } as Section,
    intro: (reverse = false, bg?: 'alt'): Section => ({ type: 'split', ...a.intro, reverse, bg, cta: `Book a Free ${a.city} Estimate →` }),
    services: (bg?: 'alt'): Section => ({ type: 'links', kicker: `Painting Services in ${a.city}`, h2: `What We Paint in ${a.city}`, links: a.services, bg }),
    grid: (bg?: 'alt'): Section => ({ type: 'grid', kicker: 'Recent Work', h2: a.grid.h2, intro: a.grid.intro ?? v.grid, tiles: a.grid.tiles, bg }),
    tips: (reverse = false, bg?: 'alt'): Section => ({ type: 'checklist', ...a.tips, reverse, bg }),
    reviews: (bg?: 'alt'): Section => ({ type: 'reviews', kicker: `${SITE.rating} Stars on Google`, h2: a.reviews!.h2, keys: a.reviews!.keys, bg }),
    pullquote: { type: 'pullquote', key: a.pullquote?.key ?? '', kicker: a.pullquote?.kicker } as Section,
    prices: (bg?: 'alt'): Section => ({ type: 'prices', kicker: `${a.city} Painting Prices`, h2: `What Painting Costs in ${a.city}`, intro: v.prices(a.city), bg }),
    faq: { type: 'faq', kicker: `${a.city} Questions`, h2: `Hiring a Painter in ${a.city}: FAQ`, intro: v.faq(a.city), items: [a.faq[0], costQA(a.city, v.costTail(a.city)), ...a.faq.slice(1)] } as Section,
    poster: { type: 'poster', ...a.poster } as Section,
    nearby: {
      type: 'links', kicker: 'Nearby Service Areas', h2: 'We Also Paint Near You', bg: 'alt',
      intro: `${v.nearby} <a href="/service-areas/">See every area we serve</a>.`,
      links: a.nearby.map((slug) => {
        const n = AREA_INDEX.find((x) => x.slug === slug);
        if (!n) throw new Error(`nearby ${slug} missing`);
        return { href: areaHref(slug), t: `${n.city}, CA`, d: `House painters in ${n.city}` };
      }),
    } as Section,
  };

  const orders: Record<Template, () => Section[]> = {
    A: () => [s.trust, s.intro(), s.services(), s.grid('alt'), s.reviews(), s.tips(true), s.prices('alt'), s.faq, s.poster, s.nearby],
    B: () => [s.stats, s.intro(true), s.reviews(), s.prices(), s.grid('alt'), s.tips(), s.services(), s.faq, s.poster, s.nearby],
    C: () => [s.intro(), s.grid('alt'), s.prices(), s.pullquote, s.tips(true), s.services('alt'), s.faq, s.poster, s.nearby],
    D: () => [s.stats, s.reviews(), s.intro(true), s.tips(), s.grid('alt'), s.services(), s.prices('alt'), s.faq, s.poster, s.nearby],
  };

  if ((a.template === 'C') !== Boolean(a.pullquote) || (a.template !== 'C') !== Boolean(a.reviews)) {
    throw new Error(`${a.slug}: template ${a.template} needs ${a.template === 'C' ? 'pullquote' : 'reviews'}`);
  }

  return {
    slug: a.slug,
    name: a.city,
    title: a.title,
    description: a.description,
    hero: { ...a.hero, variant: HERO_VARIANT[a.template] },
    sections: orders[a.template](),
  };
}

const g = SITE.guaranteeYears;
const lic = `Licensed CA #${SITE.license}`;

const INPUTS: AreaInput[] = [
  // ───────── TUJUNGA ─────────
  {
    slug: 'tujunga-ca', city: 'Tujunga', template: 'A',
    title: "House Painters Tujunga, CA | Local on Foothill Blvd | Master's Pro",
    description: `Tujunga's local painting contractor on Foothill Blvd. Interior ${PRICES.interior.low} to ${PRICES.interior.high}/sq ft, exterior ${PRICES.exterior.low} to ${PRICES.exterior.high}/sq ft. ${g}-year guarantee. 5.0 stars, ${SITE.reviewCount} Google reviews.`,
    hero: {
      kicker: 'Tujunga, CA 91042 · Our Home Base',
      h1: 'House Painters in Tujunga, CA. Your Neighbors on Foothill Blvd.',
      lede: 'Our shop is at 6470 Foothill Blvd. Call for an estimate in Tujunga and you get a painting contractor based right here in the foothills.',
      bullets: ['Based on Foothill Blvd, Tujunga', `${g}-Year Workmanship Guarantee`, 'Interior & Exterior Painting', `${SITE.rating} Stars, ${SITE.reviewCount} Google Reviews`],
      photo: '013', service: '', formTitle: 'Get your Tujunga painting quote',
      proofMeta: 'Tujunga · Sunland · Shadow Hills<br>La Crescenta · La Cañada Flintridge',
    },
    intro: {
      kicker: 'Local, Licensed, Close By', h2: 'The Painters Just Down Foothill Blvd', photo: '008',
      paras: [
        'Tujunga sits right under the San Gabriel Mountains. Summers run hot. Santa Ana winds blow dry. Homes here range from old stone and wood cottages to ranch houses and hillside builds, and all of them take a beating from the sun.',
        'That is the kind of house we paint, from a shop just down Foothill Blvd. Estimates in Tujunga are easy to schedule because we are already here.',
        `Licensed, bonded and insured under California license #${SITE.license}. Backed by a ${g}-year written workmanship guarantee.`,
      ],
    },
    services: [
      { href: '/exterior-painting/', t: 'Exterior Painting', d: 'Foothill sun and wind are hard on paint. Prep is the difference.' },
      { href: '/interior-painting/', t: 'Interior Painting', d: `Walls, ceilings and trim from ${PRICES.interior.low} per sq ft.` },
      { href: '/staining-wood-refinishing/', t: 'Staining & Wood Refinishing', d: 'Porches, railings, beams and wood doors.' },
      { href: '/epoxy-flooring/', t: 'Epoxy Garage Floors', d: 'Flake epoxy floors and full garage makeovers.' },
    ],
    grid: { h2: 'Work From Our Crew', tiles: [{ photo: '106', label: 'Stained pergola' }, { photo: '060', label: 'Entry hall' }, { photo: '036', label: 'Epoxy floor' }, { photo: '079', label: 'Clinic facade' }] },
    reviews: { h2: 'Rated 5.0 by the People Who Hired Us', keys: ['marybeth', 'ryan', 'omar'] },
    tips: {
      kicker: 'Painting in the Foothills', h2: 'What Tujunga Homes Need From a Paint Job', photo: '110',
      items: ['Prep that handles hot, dry summers and Santa Ana winds', 'Extra attention on south and west walls that bake all afternoon', 'Wood porches, rails and eaves sealed against sun and weather', 'Exterior colors picked with fading in mind', 'Dust and grime washed off before a single coat goes on'],
    },
    faq: [
      { q: 'Where are you located?', a: `Our shop is at ${SITE.addressLine}. Hours are ${SITE.hours}.` },
      { q: 'Is there a charge for estimates in Tujunga?', a: 'No. Estimates are free across our whole service area, and Tujunga is home base.' },
      { q: 'My house faces the afternoon sun. Will the paint fade?', a: 'All paint fades in direct sun over time. Fading is not a workmanship failure, so our guarantee does not cover it. Good prep and a quality exterior product slow it down, and we will help you pick colors that hold up better.' },
    ],
    poster: { kicker: 'Tujunga Painting Estimate', h2: 'Get a Free Estimate From Your Local Painter', body: 'We are right here on Foothill Blvd. Book a walkthrough and get a written quote.', photo: '012' },
    nearby: ['sunland-ca', 'la-crescenta-ca', 'la-canada-flintridge-ca', 'burbank-ca'],
  },

  // ───────── SUNLAND ─────────
  {
    slug: 'sunland-ca', city: 'Sunland', template: 'B',
    title: "Painters in Sunland, CA | Homes & Garages | Master's Pro Painting",
    description: `Painting contractor serving Sunland and Shadow Hills from nearby Tujunga. Interior ${PRICES.interior.low} to ${PRICES.interior.high}/sq ft, exterior ${PRICES.exterior.low} to ${PRICES.exterior.high}/sq ft. ${g}-year guarantee. 5.0 stars on Google.`,
    hero: {
      kicker: 'Sunland, CA 91040 · Next Door to Our Shop',
      h1: 'Painters in Sunland, CA. Homes, Garages and Outbuildings.',
      lede: 'Sunland and Shadow Hills lots often come with more than a house. Garages, studios and wood porches all need attention. We handle the whole property from our shop next door in Tujunga.',
      bullets: ['Close to Our Tujunga Shop', 'Houses, Garages & Outbuildings', `${g}-Year Workmanship Guarantee`, lic],
      photo: '105', formTitle: 'Get your Sunland painting quote',
      proofMeta: 'Sunland · Shadow Hills<br>Tujunga · La Crescenta',
    },
    intro: {
      kicker: 'Sunland and Shadow Hills', h2: 'Bigger Lots. More to Paint. One Crew.', photo: '028',
      paras: [
        'Sunland runs along the base of the mountains, with Shadow Hills and its horse properties just to the southeast. Many lots here have more than one structure on them.',
        'Detached garages, workshops, guest units, porches and wood railings. We paint and refinish all of it, so you are not juggling three contractors for one property.',
        'And because our shop is in Tujunga, coming back for a touch-up is a short drive, not a whole trip.',
      ],
    },
    services: [
      { href: '/exterior-painting/', t: 'Exterior Painting', d: 'Stucco, siding and trim, prepped for foothill heat.' },
      { href: '/staining-wood-refinishing/', t: 'Staining & Wood Refinishing', d: 'Porches, decks and railings.' },
      { href: '/epoxy-flooring/', t: 'Epoxy Garage Floors', d: 'Garage and workshop floors.' },
      { href: '/drywall-repair/', t: 'Drywall Repair', d: 'Patch and paint in one visit.' },
    ],
    grid: { h2: 'A Look at Our Work', tiles: [{ photo: '004', label: 'Open-plan interior' }, { photo: '104', label: 'Window trim' }, { photo: '019', label: 'Stained soffit' }, { photo: '076', label: 'Office repaint' }] },
    reviews: { h2: 'What Clients Say About Working With Us', keys: ['julio', 'daniel', 'kathy'] },
    tips: {
      kicker: 'Whole-Property Painting', h2: 'Everything on the Lot, Not Just the House', photo: '025',
      intro: 'Tell us about every structure when you book. One walkthrough, one written quote.',
      items: ['Main house exterior and interior', 'Detached garages and workshops', 'Guest units and studios', 'Wood porches, decks and railings refinished', 'Garage floors coated in flake epoxy', 'Entry doors and garage doors painted'],
    },
    faq: [
      { q: 'Do you work in Shadow Hills too?', a: 'Yes. Shadow Hills and Sunland are both close to our shop on Foothill Blvd in Tujunga.' },
      { q: 'Can you paint a detached garage or small outbuilding?', a: 'Yes. Garages, studios and small outbuildings get the same prep as the main house. Add them to your estimate and we price it all together.' },
      { q: 'Is porch and deck staining covered by the guarantee?', a: `Decks, steps and handrails are high-wear surfaces and are not covered by our workmanship guarantee. Walls, siding, trim and doors we paint are covered for ${g} years. <a href="/7-year-guarantee/">Full terms</a>.` },
    ],
    poster: { kicker: 'Sunland Painting Estimate', h2: 'One Walkthrough for the Whole Property', body: 'Show us everything that needs paint. We put it in one written quote.', photo: '109' },
    nearby: ['tujunga-ca', 'la-crescenta-ca', 'burbank-ca', 'glendale-ca'],
  },

  // ───────── LA CRESCENTA ─────────
  {
    slug: 'la-crescenta-ca', city: 'La Crescenta', template: 'C',
    title: "La Crescenta, CA Painting Contractor | Master's Pro Painting",
    description: `House painting in La Crescenta and Montrose, straight down Foothill Blvd from our Tujunga shop. Interior, exterior, cabinets and wood staining. ${g}-year guarantee. 5.0 stars on Google.`,
    hero: {
      kicker: 'La Crescenta, CA 91214 · Crescenta Valley',
      h1: 'House Painting in La Crescenta, CA. Straight Down Foothill Blvd.',
      lede: 'La Crescenta and Montrose sit between the Verdugos and the San Gabriels, a short drive from our shop in Tujunga. Interior, exterior, cabinets and wood. One licensed crew.',
      bullets: ['Short Drive From Tujunga', 'Interior, Exterior & Cabinets', `${g}-Year Workmanship Guarantee`, `${SITE.rating} Stars on Google`],
      photo: '102', formTitle: 'Get your La Crescenta painting quote',
      proofMeta: 'La Crescenta · Montrose<br>Crescenta Valley',
    },
    intro: {
      kicker: 'Crescenta Valley Homes', h2: 'Mountain Views. Mountain Weather. Paint That Keeps Up.', photo: '060',
      paras: [
        'The Crescenta Valley gets hot, dry summers and cooler nights than the flats below. That daily swing works on exterior paint and caulk all year.',
        'Inside, a lot of valley homes have been opened up and remodeled over the years. Fresh walls, painted trim and updated cabinets are what make a remodel look finished.',
        'We handle both from one shop on Foothill Blvd, the same road that runs right through La Crescenta.',
      ],
    },
    services: [
      { href: '/exterior-painting/', t: 'Exterior Painting', d: 'Heat-ready prep for valley homes.' },
      { href: '/cabinet-painting/', t: 'Cabinet Painting', d: 'Painted kitchens with a sprayed finish.' },
      { href: '/staining-wood-refinishing/', t: 'Staining & Wood Refinishing', d: 'Soffits, beams, doors and natural wood cabinets.' },
      { href: '/interior-painting/', t: 'Interior Painting', d: `From ${PRICES.interior.low} per sq ft.` },
    ],
    grid: { h2: 'Kitchens, Rooms and Exteriors We Have Painted', tiles: [{ photo: '042', label: 'White kitchen' }, { photo: '018', label: 'Stained cabinets' }, { photo: '067', label: 'Bedroom' }, { photo: '104', label: 'Window trim' }] },
    pullquote: { key: 'molly', kicker: 'Repeat Client Review' },
    tips: {
      kicker: 'Before You Paint in La Crescenta', h2: 'What We Check on Every Valley Home', photo: '107',
      items: ['Caulk and seals around windows and trim, which take a beating from heat swings', 'Wood eaves and soffits that dry out and gray', 'South and west exposures that fade fastest', 'Old paint that needs scraping before anything goes over it'],
    },
    faq: [
      { q: 'Do you serve Montrose too?', a: 'Yes. La Crescenta, Montrose and the rest of the Crescenta Valley are a short drive along Foothill Blvd from our shop.' },
      { q: 'Can you refinish wood cabinets instead of painting them?', a: 'Yes. If your wood is in good shape, staining keeps the grain. See <a href="/staining-wood-refinishing/">staining and wood refinishing</a>.' },
      { q: 'How does the estimate work?', a: 'We schedule a free walkthrough, measure, talk through colors and prep, then send you a written quote.' },
    ],
    poster: { kicker: 'La Crescenta Painting Estimate', h2: 'Book Your Free Walkthrough in the Crescenta Valley', body: `Written quote. Licensed crew. ${g}-year workmanship guarantee.`, photo: '031' },
    nearby: ['tujunga-ca', 'la-canada-flintridge-ca', 'glendale-ca', 'sunland-ca'],
  },

  // ───────── LA CAÑADA FLINTRIDGE ─────────
  {
    slug: 'la-canada-flintridge-ca', city: 'La Cañada Flintridge', template: 'D',
    title: "Painters La Cañada Flintridge, CA | Master's Pro Painting",
    description: `Detail-first painting for La Cañada Flintridge homes. Interior, exterior, cabinets and wood staining. Licensed CA #${SITE.license}. ${g}-year guarantee. 5.0 stars on Google.`,
    hero: {
      kicker: 'La Cañada Flintridge, CA 91011',
      h1: 'Painters in La Cañada Flintridge. Detail Work for Bigger Homes.',
      lede: 'Larger homes, mature trees and plenty of wood detail. La Cañada Flintridge homes reward a painter who takes prep seriously and protects the property while working.',
      bullets: ['Detail-First Prep', 'Landscaping Protected', `${g}-Year Workmanship Guarantee`, lic],
      photo: '005', formTitle: 'Get your La Cañada Flintridge quote',
      proofMeta: 'La Cañada Flintridge<br>La Crescenta · Glendale',
    },
    reviews: { h2: 'Clients on Bigger, High-End Jobs', keys: ['shane', 'anthony', 'michael'] },
    intro: {
      kicker: 'Homes in La Cañada Flintridge', h2: 'More House, More Trim, More Reasons to Do It Right', photo: '101',
      paras: [
        'La Cañada Flintridge is known for large lots, tree-lined streets and homes with real architectural detail. More trim, more eaves, more wood. More places for a rushed job to show.',
        'Our reviewers talk about meticulous work on high-end projects and on large homes inside and out. That is the standard we bring up the hill.',
        'Plants, hardscape and walkways get covered before prep starts. We work around your landscaping, not through it.',
      ],
    },
    tips: {
      kicker: 'Wood and Detail', h2: 'The Details We Pay Attention To', photo: '020',
      items: ['Eaves, soffits and fascia, stained or painted', 'Exposed beams and wood ceilings', 'Built-ins and natural wood cabinets', 'Entry doors refinished on a work stand', 'Crisp lines where trim meets walls'],
    },
    grid: { h2: 'Detail Work by Our Crew', tiles: [{ photo: '045', label: 'Charcoal vanity' }, { photo: '106', label: 'Stained pergola' }, { photo: '063', label: 'Alcove' }, { photo: '077', label: 'Green walls' }] },
    services: [
      { href: '/staining-wood-refinishing/', t: 'Staining & Wood Refinishing', d: 'Beams, soffits, doors and cabinets.' },
      { href: '/exterior-painting/', t: 'Exterior Painting', d: 'Full repaints with detailed trim.' },
      { href: '/cabinet-painting/', t: 'Cabinet Painting', d: 'Sprayed finish kitchens and vanities.' },
      { href: '/interior-painting/', t: 'Interior Painting', d: 'Walls, ceilings and trim.' },
    ],
    faq: [
      { q: 'Do you paint larger homes?', a: 'Yes. One longtime client has hired us over many years to paint the interior and exterior of large homes, plus drywall repairs.' },
      { q: 'Can you protect landscaping and mature trees?', a: 'Yes. Plants, walkways and hardscape get covered before prep starts, and we plan ladder and equipment placement around your yard.' },
      { q: 'Do you stain beams, doors and wood trim?', a: 'Yes. See <a href="/staining-wood-refinishing/">staining and wood refinishing</a>.' },
    ],
    poster: { kicker: 'La Cañada Flintridge Estimate', h2: 'A Detailed Quote for a Detailed Home', body: `Free walkthrough. Every surface in writing. ${g}-year guarantee.`, photo: '108' },
    nearby: ['la-crescenta-ca', 'glendale-ca', 'tujunga-ca', 'burbank-ca'],
  },

  // ───────── BURBANK ─────────
  {
    slug: 'burbank-ca', city: 'Burbank', template: 'A',
    title: "House Painters Burbank, CA | Interior & Exterior | Master's Pro",
    description: `Burbank house painters for stucco, ranch and Spanish-style homes. Interior ${PRICES.interior.low} to ${PRICES.interior.high}/sq ft, exterior ${PRICES.exterior.low} to ${PRICES.exterior.high}/sq ft. ${g}-year guarantee. 5.0 stars, ${SITE.reviewCount} Google reviews.`,
    hero: {
      kicker: 'Burbank, CA · 91501 to 91506',
      h1: 'House Painters in Burbank, CA. Stucco, Trim and Everything Between.',
      lede: 'Ranch homes, Spanish-style houses and a lot of stucco. Burbank homes need prep that stands up to Valley heat. That is exactly how we paint.',
      bullets: ['Stucco, Siding & Trim', `Interior From ${PRICES.interior.low}/sq ft`, `${g}-Year Workmanship Guarantee`, `${SITE.rating} Stars, ${SITE.reviewCount} Google Reviews`],
      photo: '103', formTitle: 'Get your Burbank painting quote',
      proofMeta: 'Burbank Hills · Magnolia Park<br>Rancho · Media District',
    },
    intro: {
      kicker: 'Painting Burbank Homes', h2: 'Valley Heat Is Hard on Stucco. Prep Beats It.', photo: '102',
      paras: [
        'From the hillside streets down to the Rancho and Magnolia Park, Burbank is full of mid-century ranch homes and older Spanish-style houses. Most of them wear stucco with wood trim.',
        'Stucco cracks. Trim dries out. Paint over either without patching and priming and it fails early in the Valley sun.',
        `We patch, seal and prime first. Then we paint. That is why we can put a ${g}-year workmanship guarantee in writing.`,
      ],
    },
    services: [
      { href: '/exterior-painting/', t: 'Exterior Painting', d: 'Stucco and trim repaints.' },
      { href: '/interior-painting/', t: 'Interior Painting', d: `${PRICES.interior.low} to ${PRICES.interior.high} per sq ft.` },
      { href: '/cabinet-painting/', t: 'Cabinet Painting', d: 'Update the kitchen without a remodel.' },
      { href: '/commercial-painting/', t: 'Commercial Painting', d: 'Offices, clinics and storefronts.' },
    ],
    grid: { h2: 'Inside, Outside and Underfoot', tiles: [{ photo: '049', label: 'Gray cabinets' }, { photo: '060', label: 'Entry hall' }, { photo: '036', label: 'Epoxy floor' }, { photo: '078', label: 'Office trim' }] },
    reviews: { h2: 'Why Burbank Neighbors Should Call Us', keys: ['delmy', 'leslie', 'wendy'] },
    tips: {
      kicker: 'Burbank Exterior Checklist', h2: 'What We Look at on a Burbank Exterior', photo: '104',
      items: ['Hairline stucco cracks to patch before paint', 'Wood trim, fascia and window frames that have dried out', 'Chalky old paint that needs washing off', 'Garage doors and entry doors that face the street', 'Colors that suit the style of the house'],
    },
    faq: [
      { q: 'Do you paint Spanish-style and ranch homes?', a: 'Yes. Stucco walls with wood trim are exactly what we prep and paint.' },
      { q: 'Can you paint my kitchen cabinets instead of replacing them?', a: 'Yes. We spray cabinets for a smooth finish with no brush marks. See <a href="/cabinet-painting/">cabinet painting</a>.' },
      { q: 'Do you work in the Rancho and Magnolia Park areas?', a: 'Yes. We serve all of Burbank, from the hillside streets down to the Rancho and Magnolia Park.' },
    ],
    poster: { kicker: 'Burbank Painting Estimate', h2: 'Free Painting Estimate in Burbank', body: 'Walkthrough, written quote and a licensed crew that shows up when we say we will.', photo: '008' },
    nearby: ['glendale-ca', 'north-hollywood-ca', 'sunland-ca', 'sherman-oaks-ca'],
  },

  // ───────── GLENDALE ─────────
  {
    slug: 'glendale-ca', city: 'Glendale', template: 'B',
    title: "Painting Contractor Glendale, CA | Homes & Condos | Master's Pro",
    description: `Glendale painting contractor for houses, condos and offices. Interior, exterior, cabinet and commercial painting. Licensed CA #${SITE.license}. ${g}-year guarantee. 5.0 stars on Google.`,
    hero: {
      kicker: 'Glendale, CA · Homes, Condos & Offices',
      h1: 'Painting Contractor in Glendale, CA. Houses, Condos and Offices.',
      lede: 'Hillside homes up north, condos and offices downtown. Glendale needs a painter who can handle all three and keep the HOA and the property manager happy.',
      bullets: ['Homes, Condos & Offices', 'HOA Color Rules Followed', `${g}-Year Workmanship Guarantee`, lic],
      photo: '043', formTitle: 'Get your Glendale painting quote',
      proofMeta: 'Rossmoyne · Verdugo Woodlands<br>Chevy Chase Canyon · Downtown',
    },
    intro: {
      kicker: 'Painting in Glendale', h2: 'From Rossmoyne to Downtown, One Crew Covers It', photo: '004',
      paras: [
        'Glendale has Spanish Colonial and Tudor homes in neighborhoods like Rossmoyne and Verdugo Woodlands, hillside streets up toward Chevy Chase Canyon, and a dense core of condos and offices near Brand Blvd.',
        'Each one paints differently. Detailed older homes need patient prep. Condos come with HOA color lists and building rules. Offices need the work done without wrecking the workday.',
        `We handle all of it, with the same licensed crew and the same ${g}-year workmanship guarantee.`,
      ],
    },
    reviews: { h2: 'Why Clients Keep Calling Us Back', keys: ['heather', 'jorge', 'max'] },
    grid: { h2: 'Doors, Rooms and Facades We Have Painted', tiles: [{ photo: '101', label: 'Lap siding' }, { photo: '016', label: 'Slatted door' }, { photo: '070', label: 'Fresh walls' }, { photo: '079', label: 'Clinic facade' }] },
    tips: {
      kicker: 'Condo and HOA Painting', h2: 'Painting a Condo or Townhome in Glendale', photo: '052',
      intro: 'Shared buildings have rules. We work inside them.',
      items: ['HOA color approval checked before we start', 'Building hours and noise rules followed', 'Parking and elevator use planned ahead', 'Common areas protected', 'Cabinets and vanities updated without a remodel'],
    },
    services: [
      { href: '/interior-painting/', t: 'Interior Painting', d: 'Houses, condos and townhomes.' },
      { href: '/cabinet-painting/', t: 'Cabinet Painting', d: 'Kitchens and vanities, sprayed smooth.' },
      { href: '/commercial-painting/', t: 'Commercial Painting', d: 'Offices, clinics and retail.' },
      { href: '/exterior-painting/', t: 'Exterior Painting', d: `${PRICES.exterior.low} to ${PRICES.exterior.high} per sq ft.` },
    ],
    faq: [
      { q: 'Do you paint condos and townhomes?', a: 'Yes. If you have an HOA, check their color and schedule rules first, or send them to us. We work to the approved list.' },
      { q: 'Do you do commercial painting in Glendale?', a: 'Yes. Offices, clinics and retail. See <a href="/commercial-painting/">commercial painting</a>.' },
      { q: 'Do you serve the hillside neighborhoods?', a: 'Yes. From Verdugo Woodlands to Chevy Chase Canyon. Hillside access is planned into the written quote so the price does not move later.' },
    ],
    poster: { kicker: 'Glendale Painting Estimate', h2: 'Get Your Glendale Painting Quote', body: 'House, condo or office. Free walkthrough and a written price.', photo: '030' },
    nearby: ['burbank-ca', 'la-crescenta-ca', 'la-canada-flintridge-ca', 'north-hollywood-ca'],
  },

  // ───────── NORTH HOLLYWOOD ─────────
  {
    slug: 'north-hollywood-ca', city: 'North Hollywood', template: 'C',
    title: "Painters North Hollywood, CA | Move-In Painting | Master's Pro",
    description: `North Hollywood painters for new homes, rentals and repaints. Interior ${PRICES.interior.low} to ${PRICES.interior.high}/sq ft, exterior ${PRICES.exterior.low} to ${PRICES.exterior.high}/sq ft. ${g}-year guarantee. 5.0 stars on Google.`,
    hero: {
      kicker: 'North Hollywood, CA · NoHo',
      h1: 'Painters in North Hollywood, CA. Move-In Ready, On Your Schedule.',
      lede: 'Just bought in NoHo? Getting a place ready to rent? We paint empty homes before move-in and lived-in homes with everything covered, on a written schedule.',
      bullets: ['Move-In Repaints', 'Interior & Exterior', `${g}-Year Workmanship Guarantee`, `${SITE.rating} Stars on Google`],
      photo: '060', formTitle: 'Get your North Hollywood quote',
      proofMeta: 'North Hollywood · NoHo Arts District<br>Valley Village · Toluca Lake area',
    },
    intro: {
      kicker: 'New Homes and Repaints', h2: 'The Best Time to Paint Is Before the Boxes Arrive', photo: '103',
      paras: [
        'North Hollywood is a mix of 1940s and 1950s bungalows, ranch homes, and a lot of condos and apartments around the NoHo Arts District.',
        'If you just bought, paint before you move in. Empty rooms mean no furniture to cover, nothing to move twice, and a cleaner result.',
        'Three of our Google reviews come from clients who hired us for a new home or a second home. Read one below.',
      ],
    },
    grid: { h2: 'Kitchens, Garages and Offices', tiles: [{ photo: '042', label: 'White kitchen' }, { photo: '058', label: 'Garage refresh' }, { photo: '107', label: 'Stained soffit' }, { photo: '076', label: 'Office' }] },
    pullquote: { key: 'nelson', kicker: 'New Home Review' },
    tips: {
      kicker: 'Move-In Painting Checklist', h2: 'Paint These Before You Unpack', photo: '105',
      items: ['Walls and ceilings in every room', 'Trim, doors and baseboards', 'Kitchen and bathroom cabinets', 'Garage walls, ceiling and floor', 'Front door and garage door for curb appeal'],
    },
    services: [
      { href: '/interior-painting/', t: 'Interior Painting', d: 'Empty-home repaints before move-in.' },
      { href: '/cabinet-painting/', t: 'Cabinet Painting', d: 'New-looking kitchen, same cabinets.' },
      { href: '/epoxy-flooring/', t: 'Epoxy Garage Floors', d: 'Finish the garage before the boxes land.' },
      { href: '/exterior-painting/', t: 'Exterior Painting', d: 'Curb appeal for bungalows and ranch homes.' },
    ],
    faq: [
      { q: 'Can you paint before we move in?', a: 'Yes. Empty homes are the easiest homes to paint. Tell us your closing and move-in dates when you book and we build the schedule around them.' },
      { q: 'Do you serve Valley Village and Toluca Lake?', a: 'Ask us. We cover North Hollywood and nearby neighborhoods across the Valley.' },
      { q: 'Do you paint rental units between tenants?', a: 'Yes. Some of our clients use us across multiple properties. Tell us the turnover date and we plan around it.' },
    ],
    poster: { kicker: 'North Hollywood Painting Estimate', h2: 'Get It Painted Before Move-In Day', body: 'Free walkthrough. Written quote with a schedule you can plan a move around.', photo: '029' },
    nearby: ['burbank-ca', 'sherman-oaks-ca', 'glendale-ca', 'sunland-ca'],
  },

  // ───────── SHERMAN OAKS ─────────
  {
    slug: 'sherman-oaks-ca', city: 'Sherman Oaks', template: 'D',
    title: "House Painters Sherman Oaks, CA | Master's Pro Painting",
    description: `Sherman Oaks painters for hillside and valley homes. Interior, exterior, cabinets, built-ins and entry doors. Licensed CA #${SITE.license}. ${g}-year guarantee. 5.0 stars on Google.`,
    hero: {
      kicker: 'Sherman Oaks, CA 91403 & 91423',
      h1: 'House Painters in Sherman Oaks, CA. Hillside or Flats, Done Right.',
      lede: 'South of Ventura Blvd the streets climb into the hills. North of it the Valley flattens out and heats up. We paint both, and we price the access in up front.',
      bullets: ['Hillside Access Planned', 'Cabinets & Built-Ins', `${g}-Year Workmanship Guarantee`, lic],
      photo: '042', formTitle: 'Get your Sherman Oaks quote',
      proofMeta: 'Sherman Oaks hills<br>Sherman Oaks flats',
    },
    reviews: { h2: 'What Our Clients Say', keys: ['sandee', 'mario', 'ryan'] },
    intro: {
      kicker: 'Painting in Sherman Oaks', h2: 'Two Kinds of Houses. One Standard of Prep.', photo: '067',
      paras: [
        'Hillside homes south of Ventura Blvd come with steep driveways, tall walls and tight access. Homes in the flats to the north deal with serious Valley heat.',
        'Hillside jobs need more ladder and staging planning, so we build it into the quote and the price does not move later. Homes in the flats need prep that survives the sun, so that gets built in too.',
        'Inside, a lot of Sherman Oaks homes have home offices, built-ins and updated kitchens. We paint and spray those as well.',
      ],
    },
    tips: {
      kicker: 'Home Offices and Built-Ins', h2: 'The Inside Jobs Sherman Oaks Clients Ask For', photo: '054',
      items: ['Built-in bookcases and shelving sprayed smooth', 'Kitchen cabinets and islands', 'Home office walls and trim', 'Wood entry doors refinished', 'Ceilings and stairwells'],
    },
    grid: { h2: 'Trim, Pantries, Beams and Lift Work', tiles: [{ photo: '104', label: 'Window trim' }, { photo: '048', label: 'Pantry doors' }, { photo: '033', label: 'Wood beams' }, { photo: '108', label: 'Painted brick' }] },
    services: [
      { href: '/cabinet-painting/', t: 'Cabinet Painting', d: 'Kitchens, islands and built-ins.' },
      { href: '/staining-wood-refinishing/', t: 'Staining & Wood Refinishing', d: 'Entry doors, beams and wood trim.' },
      { href: '/exterior-painting/', t: 'Exterior Painting', d: 'Hillside and flats homes.' },
      { href: '/interior-painting/', t: 'Interior Painting', d: `${PRICES.interior.low} to ${PRICES.interior.high} per sq ft.` },
    ],
    faq: [
      { q: 'Do you work on hillside homes south of Ventura?', a: 'Yes. Hillside homes mean more ladder and access planning. We factor it into the written quote so the price does not change later.' },
      { q: 'Can you refinish wood entry doors?', a: 'Yes. Some doors come off and go on a work stand so every edge gets finished. See <a href="/staining-wood-refinishing/">staining and wood refinishing</a>.' },
      { q: 'Do you paint built-ins and bookcases?', a: 'Yes. Built-ins get the same prep and sprayed finish as kitchen cabinets.' },
    ],
    poster: { kicker: 'Sherman Oaks Painting Estimate', h2: 'Book Your Sherman Oaks Walkthrough', body: 'Hillside or flats. We look at access, measure, and put the price in writing.', photo: '065' },
    nearby: ['north-hollywood-ca', 'burbank-ca', 'hollywood-hills-ca', 'west-los-angeles-ca'],
  },

  // ───────── HOLLYWOOD HILLS ─────────
  {
    slug: 'hollywood-hills-ca', city: 'Hollywood Hills', template: 'A',
    title: "Hollywood Hills Painters | Hillside Homes | Master's Pro Painting",
    description: `Hollywood Hills painters for hillside homes, wood exteriors and high-end interiors. Access planned, detail-first prep. Licensed CA #${SITE.license}. ${g}-year guarantee. 5.0 stars.`,
    hero: {
      kicker: 'Hollywood Hills, CA · 90068 & 90046',
      h1: 'Painters in the Hollywood Hills. Steep Streets, Serious Detail.',
      lede: 'Narrow roads, tight parking, big views and a lot of wood. Painting in the Hills takes planning before it takes a brush. We do both.',
      bullets: ['Access & Parking Planned', 'High-End Detail Work', `${g}-Year Workmanship Guarantee`, `${SITE.rating} Stars on Google`],
      photo: '033', formTitle: 'Get your Hollywood Hills quote',
      proofMeta: 'Laurel Canyon · Beachwood Canyon<br>Nichols Canyon · Outpost Estates',
    },
    intro: {
      kicker: 'Hillside Painting', h2: 'The Hard Part in the Hills Is Getting There', photo: '110',
      paras: [
        'Laurel Canyon, Beachwood Canyon, Nichols Canyon, Outpost Estates. Beautiful streets. Narrow roads, tight turns and almost no parking.',
        'So the job starts with logistics. Where the crew parks. Where materials go. How ladders reach a wall over a slope. We sort that out on the walkthrough, not on day one.',
        'Hillside homes also mix stucco, glass and a lot of exterior wood. Every surface gets the prep it needs. One reviewer who worked with us on high-end projects called us diligent, professional and experienced.',
      ],
    },
    services: [
      { href: '/exterior-painting/', t: 'Exterior Painting', d: 'Hillside homes, planned access.' },
      { href: '/staining-wood-refinishing/', t: 'Staining & Wood Refinishing', d: 'Siding, beams, soffits and doors.' },
      { href: '/interior-painting/', t: 'Interior Painting', d: 'High-end interiors with crisp lines.' },
      { href: '/cabinet-painting/', t: 'Cabinet Painting', d: 'Sprayed finish kitchens.' },
    ],
    grid: { h2: 'Kitchens, Doors and Wood Work', tiles: [{ photo: '106', label: 'Stained pergola' }, { photo: '011', label: 'Entry doors' }, { photo: '005', label: 'Dining room' }, { photo: '028', label: 'Porch & rails' }] },
    reviews: { h2: 'Clients Who Hired Us for Detail Work', keys: ['anthony', 'kathy', 'jose'] },
    tips: {
      kicker: 'Hillside Painting Checklist', h2: 'What We Plan Before Day One', photo: '107',
      items: ['Crew parking and material drop-off on a narrow street', 'Ladders and staging on sloped ground', 'Exterior wood soffits, decks and siding that need stain or seal', 'Protection for glass, hardscape and landscaping', 'A schedule that respects your neighbors'],
    },
    faq: [
      { q: 'Can you work on steep streets with little parking?', a: 'Yes. Tell us about parking and access when you book. We plan crew vehicles and material drop-off before the job starts.' },
      { q: 'Do you stain exterior wood, decks and railings?', a: 'Yes. Decks, steps and handrails are high-wear surfaces and are not covered by our workmanship guarantee. See <a href="/staining-wood-refinishing/">staining and wood refinishing</a>.' },
      { q: 'Do you work on high-end homes?', a: 'Yes. One reviewer has worked with us on several high-end projects that required special attention.' },
    ],
    poster: { kicker: 'Hollywood Hills Painting Estimate', h2: 'Book a Walkthrough in the Hills', body: 'We check access, measure every surface and give you a written price.', photo: '031' },
    nearby: ['sherman-oaks-ca', 'west-los-angeles-ca', 'burbank-ca', 'north-hollywood-ca'],
  },

  // ───────── SANTA MONICA ─────────
  {
    slug: 'santa-monica-ca', city: 'Santa Monica', template: 'B',
    title: "House Painters Santa Monica, CA | Coastal Prep | Master's Pro",
    description: `Santa Monica painters for coastal homes and condos. Prep built for salt air and marine layer. Interior ${PRICES.interior.low} to ${PRICES.interior.high}/sq ft, exterior ${PRICES.exterior.low} to ${PRICES.exterior.high}/sq ft. ${g}-year guarantee.`,
    hero: {
      kicker: 'Santa Monica, CA · 90401 to 90405',
      h1: 'House Painters in Santa Monica, CA. Prep Built for Salt Air.',
      lede: 'Marine layer mornings, salt in the air and plenty of wood near the water. Coastal paint jobs live or die on surface prep. Ours start clean and dry.',
      bullets: ['Coastal Surface Prep', 'Homes & Condos', `${g}-Year Workmanship Guarantee`, lic],
      photo: '052', formTitle: 'Get your Santa Monica quote',
      proofMeta: 'North of Montana · Ocean Park<br>Sunset Park · Wilshire Montana',
    },
    intro: {
      kicker: 'Painting Near the Ocean', h2: 'Salt and Moisture Are the Enemies of Coastal Paint', photo: '013',
      paras: [
        'Santa Monica homes, from North of Montana to Ocean Park and Sunset Park, live in a different climate than the Valley. Less scorching heat. More moisture, fog and salt.',
        'Salt and grime left on a surface stop new paint from bonding. Moisture trapped under paint pushes it off. So on the coast, washing surfaces and letting them dry properly matters even more.',
        'Inside, Santa Monica condos and homes get the same care. Covered floors, sharp lines and a clean site every day.',
      ],
    },
    reviews: { h2: 'What Clients Say About Working With Us', keys: ['derek', 'molly', 'omar'] },
    grid: { h2: 'Cabinets, Rooms, Doors and Floors', tiles: [{ photo: '040', label: 'White uppers' }, { photo: '071', label: 'Fresh walls' }, { photo: '016', label: 'Slatted door' }, { photo: '101', label: 'Lap siding' }] },
    tips: {
      kicker: 'Coastal Exterior Checklist', h2: 'How We Prep a Coastal Exterior', photo: '109',
      items: ['Salt and grime washed off every surface', 'Surfaces left to dry before primer', 'Peeling and flaking areas scraped back to sound paint', 'Bare wood primed and sealed', 'Trim and window seals caulked tight'],
    },
    services: [
      { href: '/exterior-painting/', t: 'Exterior Painting', d: 'Coastal prep that helps paint bond.' },
      { href: '/interior-painting/', t: 'Interior Painting', d: 'Homes and condos.' },
      { href: '/cabinet-painting/', t: 'Cabinet Painting', d: 'Sprayed smooth, no brush marks.' },
      { href: '/staining-wood-refinishing/', t: 'Staining & Wood Refinishing', d: 'Wood siding, doors and trim.' },
    ],
    faq: [
      { q: 'Does salt air affect exterior paint?', a: 'Yes. Salt and moisture make surface prep matter even more. Clean, dry, primed surfaces hold paint. Dirty or damp ones do not.' },
      { q: 'Do you drive to Santa Monica from Tujunga?', a: 'Yes. Santa Monica is part of our service area and estimates here are free.' },
      { q: 'Can you paint a condo in a shared building?', a: 'Yes. We work within building rules on hours, elevators and parking. Send us the rules with your request.' },
    ],
    poster: { kicker: 'Santa Monica Painting Estimate', h2: 'Get a Coastal Painting Quote', body: `Free walkthrough. Written price. ${g}-year workmanship guarantee.`, photo: '030' },
    nearby: ['venice-ca', 'west-los-angeles-ca', 'hollywood-hills-ca', 'sherman-oaks-ca'],
  },

  // ───────── VENICE ─────────
  {
    slug: 'venice-ca', city: 'Venice', template: 'C',
    title: "Painters Venice, CA | Wood Siding & Bungalows | Master's Pro",
    description: `Venice painters for beach bungalows, wood siding and modern remodels. Salt-air prep, wood staining and interiors. Licensed CA #${SITE.license}. ${g}-year guarantee. 5.0 stars on Google.`,
    hero: {
      kicker: 'Venice, CA 90291',
      h1: 'Painters in Venice, CA. Bungalows, Wood Siding and Beach Air.',
      lede: 'Small lots, wood siding, bold colors and salt air a few blocks from the sand. Venice homes need paint and stain that is prepped for the beach.',
      bullets: ['Wood Siding & Trim', 'Staining & Sealing', `${g}-Year Workmanship Guarantee`, `${SITE.rating} Stars on Google`],
      photo: '106', formTitle: 'Get your Venice painting quote',
      proofMeta: 'Venice Canals · Abbot Kinney<br>Oakwood · Venice Beach',
    },
    intro: {
      kicker: 'Painting in Venice', h2: 'Small Houses. Big Personality. Tough Conditions.', photo: '025',
      paras: [
        'Venice is beach bungalows off Abbot Kinney, homes along the Canals, Oakwood cottages and a lot of modern remodels squeezed onto small lots.',
        'Wood siding and trim are everywhere, and wood near the ocean takes moisture and salt every day. Bare spots need priming. Stained wood needs sealing. Skip it and the finish goes gray and splits.',
        'Tight lots also mean tight work areas. We protect your neighbors\' property as carefully as yours.',
      ],
    },
    grid: { h2: 'Vanities, Kitchens and Walls', tiles: [{ photo: '045', label: 'Charcoal vanity' }, { photo: '004', label: 'Open-plan interior' }, { photo: '015', label: 'Wood cabinets' }, { photo: '077', label: 'Painted walls' }] },
    pullquote: { key: 'karla', kicker: 'From Our Google Reviews' },
    tips: {
      kicker: 'Beach-Town Wood Care', h2: 'Wood Near the Ocean Needs More', photo: '020',
      items: ['Siding and trim washed and dried before paint', 'Bare and weathered wood primed', 'Stained soffits, doors and decks sealed', 'Joints and seams caulked against moisture', 'Bold colors chosen with sun fading in mind'],
    },
    services: [
      { href: '/exterior-painting/', t: 'Exterior Painting', d: 'Wood siding and stucco by the beach.' },
      { href: '/staining-wood-refinishing/', t: 'Staining & Wood Refinishing', d: 'Soffits, doors, decks and railings.' },
      { href: '/interior-painting/', t: 'Interior Painting', d: `${PRICES.interior.low} to ${PRICES.interior.high} per sq ft.` },
      { href: '/cabinet-painting/', t: 'Cabinet Painting', d: 'Kitchens and vanities, sprayed smooth.' },
    ],
    faq: [
      { q: 'Can you paint wood siding near the beach?', a: 'Yes. Wood by the ocean takes moisture and salt, so washing, drying and priming bare spots are not optional. That prep is what our guarantee depends on.' },
      { q: 'Can you refinish a wood deck or porch?', a: 'Yes. Keep in mind decks, steps and handrails are high-wear surfaces and are not covered by our workmanship guarantee. See <a href="/staining-wood-refinishing/">staining and wood refinishing</a>.' },
      { q: 'Do you serve the Venice Canals area?', a: 'Yes. All of Venice, including the Canals, Abbot Kinney and Oakwood.' },
    ],
    poster: { kicker: 'Venice Painting Estimate', h2: 'Get Your Venice Painting Quote', body: 'Free walkthrough. Straight advice on paint vs stain. Written price.', photo: '103' },
    nearby: ['santa-monica-ca', 'west-los-angeles-ca', 'hollywood-hills-ca', 'sherman-oaks-ca'],
  },

  // ───────── WEST LOS ANGELES ─────────
  {
    slug: 'west-los-angeles-ca', city: 'West Los Angeles', template: 'A',
    title: "Painters West Los Angeles | Homes, Condos & Offices | Master's Pro",
    description: `West Los Angeles painters for homes, condos, rentals and offices. Sawtelle, Rancho Park, Cheviot Hills. Licensed CA #${SITE.license}. ${g}-year guarantee. 5.0 stars, ${SITE.reviewCount} Google reviews.`,
    hero: {
      kicker: 'West Los Angeles, CA · 90025 & 90064',
      h1: 'Painters in West Los Angeles. Homes, Rentals and Offices.',
      lede: 'Condos in Sawtelle, family homes in Rancho Park and Cheviot Hills, and offices along the boulevards. West LA work comes in every shape. We paint all of it.',
      bullets: ['Homes, Condos & Offices', 'Multi-Property Clients', `${g}-Year Workmanship Guarantee`, lic],
      photo: '001', formTitle: 'Get your West LA painting quote',
      proofMeta: 'Sawtelle · Rancho Park<br>Cheviot Hills · West LA',
    },
    intro: {
      kicker: 'Painting in West LA', h2: 'One Painter for Every Property You Own', photo: '105',
      paras: [
        'West Los Angeles has a little of everything. Apartment and condo buildings, single-family homes on quiet streets, and offices and clinics on the main corridors.',
        'Plenty of owners here have more than one property. One of our reviewers has used us on multiple projects across multiple properties and calls us responsive and responsible.',
        `Homeowner, landlord or practice manager, you get the same written quote, the same prep and the same ${g}-year workmanship guarantee.`,
      ],
    },
    services: [
      { href: '/commercial-painting/', t: 'Commercial Painting', d: 'Offices and clinics.' },
      { href: '/interior-painting/', t: 'Interior Painting', d: 'Homes, condos and rental units.' },
      { href: '/cabinet-painting/', t: 'Cabinet Painting', d: 'Kitchens and baths without a remodel.' },
      { href: '/exterior-painting/', t: 'Exterior Painting', d: `${PRICES.exterior.low} to ${PRICES.exterior.high} per sq ft.` },
    ],
    grid: { h2: 'Pantries, Exteriors and Interiors', tiles: [{ photo: '047', label: 'Pantry doors' }, { photo: '012', label: 'Exterior trim' }, { photo: '067', label: 'Bedroom' }, { photo: '018', label: 'Wood cabinets' }] },
    reviews: { h2: 'Homeowners and Businesses Rate Us 5.0', keys: ['heather', 'hugo', 'julio'] },
    tips: {
      kicker: 'Rentals and Offices', h2: 'Built for Owners and Managers', photo: '078',
      items: ['Rental units painted between tenants', 'Offices and clinics painted around business hours', 'A written scope for every property', 'Consistent colors across multiple units', 'A clean handoff, ready for the next tenant'],
    },
    faq: [
      { q: 'Do you paint offices in West LA?', a: 'Yes. Offices, clinics and retail. One clinic group uses us across all of its sites. See <a href="/commercial-painting/">commercial painting</a>.' },
      { q: 'Do you work in Sawtelle, Rancho Park and Cheviot Hills?', a: 'Yes, along with the rest of West Los Angeles.' },
      { q: 'Do you paint rental units and condos?', a: 'Yes. Several of our clients use us on more than one property. Tell us your turnover dates and we plan around them.' },
    ],
    poster: { kicker: 'West LA Painting Estimate', h2: 'Get Every Property on One Quote', body: 'Free walkthrough. Written scope per property. Licensed crew.', photo: '031' },
    nearby: ['santa-monica-ca', 'venice-ca', 'hollywood-hills-ca', 'sherman-oaks-ca'],
  },
];

export const AREAS: PageData[] = INPUTS.map(build);
