import type { PageData } from './types';
import { SITE, PRICES } from './site';

// Service pages. Each page: unique copy, unique section order, one of four
// hero layouts, exactly 8 distinct photos (enforced at build).
// Prices: interior + exterior per sq ft. Other services are quoted per project.

const g = SITE.guaranteeYears;
const areaLinks = 'We paint across <a href="/service-areas/tujunga-ca/">Tujunga</a>, <a href="/service-areas/burbank-ca/">Burbank</a>, <a href="/service-areas/glendale-ca/">Glendale</a>, <a href="/service-areas/north-hollywood-ca/">North Hollywood</a>, <a href="/service-areas/santa-monica-ca/">Santa Monica</a> and <a href="/service-areas/">the rest of our service area</a>.';

export const SERVICES: PageData[] = [
  // ───────────────────────────── INTERIOR ─────────────────────────────
  {
    slug: 'interior-painting',
    name: 'Interior Painting',
    title: `Interior Painters Tujunga, CA | From ${PRICES.interior.low}/sq ft | Master's Pro`,
    description: `Interior house painting from ${PRICES.interior.low} to ${PRICES.interior.high} per sq ft. Walls, ceilings, trim and doors. Floors and furniture protected. 7-year guarantee. 5.0 stars on Google. Call ${SITE.phone}.`,
    hero: {
      variant: 'split',
      kicker: 'Interior Painting · Tujunga & Greater Los Angeles',
      h1: 'Interior House Painting in Tujunga, CA. Clean Lines. Clean House.',
      lede: 'Walls, ceilings, trim, doors and garages. We cover your floors and furniture, fix the dings, and paint it right. Then we clean up like we were never there.',
      bullets: [`${PRICES.interior.low} to ${PRICES.interior.high} per sq ft`, `${g}-Year Workmanship Guarantee`, 'Floors & Furniture Protected', `${SITE.reviewCount} Five-Star Google Reviews`],
      photo: '060',
      formTitle: 'Get your interior painting quote',
      service: 'Interior Painting',
      proofMeta: 'Walls · Ceilings · Trim<br>Doors · Garages · Lime wash',
    },
    sections: [
      { type: 'reviews', kicker: 'Interior Jobs, Real Reviews', h2: 'What Homeowners Say About Our Interior Work', keys: ['wendy', 'wildwood', 'max'] },
      {
        type: 'split', kicker: 'Why Interior Paint Jobs Look Tired Fast', h2: 'Paint Is the Easy Part. Prep Is the Job.', photo: '004',
        paras: [
          'Roller marks. Patchy sheen over old nail holes. Tape lines that bled onto the ceiling. None of that is a paint problem. It is a prep problem.',
          'So we start with the boring stuff. Fill the holes. Sand the patches. Caulk the gaps in the trim. Spot prime anything that would flash through. Then the finish goes on, cut in by hand at every ceiling line.',
          'You get walls that look as good in the afternoon sun as they do at night with the lights on.',
        ],
        cta: 'Book My Free Walkthrough →',
      },
      {
        type: 'price', kicker: 'Interior Painting Prices', h2: 'What Interior Painting Costs', range: `${PRICES.interior.low} to ${PRICES.interior.high}`, unit: 'per square foot', bg: 'alt',
        factors: ['Ceiling height and stairwells', 'How much patching and prep the walls need', 'Number of colors and accent walls', 'Trim, doors and built-ins added to the scope', 'Empty rooms vs furnished rooms'],
        note: 'The low end is a straight repaint of walls in good shape. The high end covers heavy prep, tall ceilings and lots of detail. Every quote is written, after a free walkthrough. No guessing from photos.',
      },
      {
        type: 'checklist', kicker: 'Included on Every Interior Job', h2: 'What You Get When We Paint Inside', photo: '112', reverse: true,
        items: ['Floors, furniture and fixtures covered before prep starts', 'Nail holes, dings and hairline cracks filled and sanded', 'Gaps in trim and baseboards caulked', 'Stains and patches spot primed', 'Even finish coats, cut in by hand at ceilings and trim', 'Daily cleanup and a final walkthrough with you'],
      },
      {
        type: 'grid', kicker: 'Recent Interior Work', h2: 'Finished Rooms by Our Crew', intro: 'Real jobs. Real photos. No stock images anywhere on this site.',
        tiles: [{ photo: '005', label: 'Dining room' }, { photo: '063', label: 'Alcove' }, { photo: '065', label: 'Window trim' }, { photo: '071', label: 'Empty-home repaint' }],
      },
      {
        type: 'steps', kicker: 'How an Interior Job Runs', h2: 'Four Steps From Walkthrough to Fresh Walls',
        steps: [
          { t: 'Free Walkthrough', b: 'We look at every room, talk colors and sheen, and measure what needs painting.' },
          { t: 'Written Quote', b: 'Scope, price and schedule in writing. You know exactly what you are paying before we start.' },
          { t: 'Protect & Prep', b: 'Cover, patch, sand, caulk and prime. The part nobody sees and everybody notices later.' },
          { t: 'Paint & Walkthrough', b: 'Finish coats, full cleanup, then we walk it with you and fix anything you point at.' },
        ],
      },
      { type: 'guarantee', photo: '113' },
      {
        type: 'faq', h2: 'Interior Painting FAQ', intro: 'The questions homeowners ask before they book an interior repaint.',
        items: [
          { q: 'How much does interior painting cost in Tujunga?', a: `Most interior projects run ${PRICES.interior.low} to ${PRICES.interior.high} per square foot. The low end is a straight repaint of walls in good shape. The high end covers heavy patching, tall ceilings, stairwells, and lots of trim or color changes. You get a written quote after a free walkthrough.` },
          { q: 'Do I need to move my furniture?', a: 'Put away small items, breakables and anything valuable. We cover floors and furniture and work around the larger pieces.' },
          { q: 'Can you paint while we are living in the house?', a: 'Yes. We keep work areas covered and tidy at the end of every day so the rest of the house stays usable.' },
          { q: 'Do you repair drywall before painting?', a: 'Small stuff like nail holes, dents and hairline cracks is part of normal prep. Bigger damage like water stains or ceiling patches is quoted as <a href="/drywall-repair/">drywall repair</a>.' },
          { q: 'Can you do lime wash or other specialty finishes?', a: 'Yes. One of our Google reviewers hired us for a lime wash and called it gorgeous. Ask about it on your walkthrough.' },
          { q: 'Is interior work covered by your guarantee?', a: `Yes. If paint we applied peels, blisters or flakes because of our prep or application within ${g} years, we fix it. Scuffs, marks and normal wear are not covered. <a href="/7-year-guarantee/">Full terms</a>.` },
        ],
      },
      { type: 'poster', kicker: 'Interior Painting Estimate', h2: 'Pick the Color. We Handle the Rest.', body: `Free walkthrough. Written quote. ${g}-year workmanship guarantee.` },
      {
        type: 'links', kicker: 'More Ways We Can Help', h2: 'Related Services', intro: areaLinks,
        links: [
          { href: '/cabinet-painting/', t: 'Cabinet Painting', d: 'Sprayed finish on kitchen and bath cabinets.' },
          { href: '/drywall-repair/', t: 'Drywall Repair', d: 'Patch it and paint it in one job.' },
          { href: '/exterior-painting/', t: 'Exterior Painting', d: `${PRICES.exterior.low} to ${PRICES.exterior.high} per sq ft.` },
        ],
      },
    ],
  },

  // ───────────────────────────── EXTERIOR ─────────────────────────────
  {
    slug: 'exterior-painting',
    name: 'Exterior Painting',
    title: `Exterior House Painters Tujunga, CA | From ${PRICES.exterior.low}/sq ft | Master's Pro`,
    description: `Exterior house painting from ${PRICES.exterior.low} to ${PRICES.exterior.high} per sq ft. Stucco, siding, trim and eaves. Washed, patched and primed first. 7-year guarantee. ${SITE.phone}.`,
    hero: {
      variant: 'banner',
      kicker: 'Exterior Painting · Tujunga & Greater Los Angeles',
      h1: 'Exterior House Painting in Tujunga, CA. Built for the LA Sun.',
      lede: 'Stucco, wood siding, trim, eaves and doors. We wash, scrape, patch and prime before a drop of finish goes on. That is why it holds up.',
      bullets: [`${PRICES.exterior.low} to ${PRICES.exterior.high} per sq ft`, `${g}-Year Workmanship Guarantee`, 'Licensed, Bonded & Insured', `${SITE.rating} Stars, ${SITE.reviewCount} Google Reviews`],
      photo: '013',
      formTitle: 'Get your exterior painting quote',
      service: 'Exterior Painting',
      proofMeta: 'Stucco · Siding · Trim<br>Eaves · Doors · Garage doors',
    },
    sections: [
      { type: 'stats' },
      {
        type: 'split', kicker: 'Why Exterior Paint Fails Out Here', h2: 'The LA Sun Finds Every Shortcut', photo: '014', reverse: true,
        paras: [
          'A south-facing wall bakes all afternoon. Santa Ana winds dry everything out. Paint rolled over chalky, dirty or cracked surfaces is the first to let go.',
          'So the surface gets washed. Loose paint gets scraped. Cracks in stucco and gaps at the trim get patched and sealed. Bare spots get primed. Then the finish goes on.',
          `Skip those steps and the peeling starts within a few summers. Do them and you get a job we will put a ${g}-year guarantee on.`,
        ],
      },
      { type: 'pullquote', key: 'mario', kicker: 'Exterior Painting Review' },
      {
        type: 'checklist', kicker: 'Included on Every Exterior Job', h2: 'What an Exterior Repaint Includes', photo: '109',
        items: ['Surfaces washed and left to dry', 'Loose and failing paint scraped and sanded', 'Stucco cracks patched. Gaps at trim and windows sealed.', 'Bare wood and patches primed', 'Windows, plants, walkways and fixtures covered', 'Finish coats on body, trim, eaves and doors', 'Site cleaned daily. Final walkthrough with you.'],
      },
      {
        type: 'price', kicker: 'Exterior Painting Prices', h2: 'What Exterior Painting Costs', range: `${PRICES.exterior.low} to ${PRICES.exterior.high}`, unit: 'per square foot', bg: 'alt',
        factors: ['One story or two, and how hard the walls are to reach', 'Stucco repair or wood rot found during prep', 'Eaves, fascia and detailed trim', 'Number of colors', 'Doors, garage doors and railings added'],
        note: 'A one-story stucco house in good shape sits near the low end. Tall walls, lots of trim and heavy repair push it up. Your written quote spells out exactly what is included.',
      },
      {
        type: 'grid', kicker: 'Recent Exterior Work', h2: 'Outside Jobs by Our Crew',
        tiles: [{ photo: '104', label: 'Window trim' }, { photo: '102', label: 'Stucco repaint' }, { photo: '108', label: 'Painted brick' }, { photo: '105', label: 'Carport & fascia' }],
      },
      { type: 'reviews', kicker: 'More Exterior Reviews', h2: 'Homeowners Who Hired Us for the Outside', keys: ['derek', 'julio', 'delmy'] },
      { type: 'guarantee', photo: '101', note: 'Sun fading, chalking, water damage and new stucco cracks from settling are not workmanship failures and are not covered.' },
      {
        type: 'faq', h2: 'Exterior Painting FAQ', intro: 'What to know before you repaint the outside of your house.',
        items: [
          { q: 'How much does it cost to paint a house exterior in Tujunga?', a: `Exterior painting runs ${PRICES.exterior.low} to ${PRICES.exterior.high} per square foot. Height, prep, trim detail and repairs decide where your house lands. The quote is written and free.` },
          { q: 'How long does an exterior repaint take?', a: 'It depends on the size of the house, how much prep it needs and the weather. Your written quote includes the schedule, so you know the start date before we begin.' },
          { q: 'Do you fix stucco cracks and wood rot?', a: 'Hairline stucco cracks and gaps get patched as part of prep. If we find rot or bigger damage, we show you and price the repair before we touch it.' },
          { q: 'When is the best time of year to paint outside in LA?', a: 'Most of the year works here. We plan around rain and extreme heat so the paint goes on and cures properly.' },
          { q: 'Do you offer waterproofing?', a: 'Yes. Ask about it during your estimate and we will look at the areas that need it.' },
          { q: 'Does the guarantee cover exteriors?', a: `Yes. Peeling, blistering, flaking, cracking or loss of adhesion from our prep or application is covered for ${g} years. Sun fading, water damage and new stucco cracks from movement are not. <a href="/7-year-guarantee/">Read the full terms</a>.` },
        ],
      },
      {
        type: 'links', kicker: 'Exterior Painting Near You', h2: 'Where We Paint Exteriors', intro: 'Based on Foothill Blvd in Tujunga. Serving the foothills, the Valley and the Westside.', bg: 'alt',
        links: [
          { href: '/service-areas/tujunga-ca/', t: 'Tujunga', d: 'Home base. Foothill homes and hillside lots.' },
          { href: '/service-areas/burbank-ca/', t: 'Burbank', d: 'Stucco, ranch homes and Spanish styles.' },
          { href: '/service-areas/la-crescenta-ca/', t: 'La Crescenta', d: 'Crescenta Valley homes up and down Foothill Blvd.' },
          { href: '/service-areas/santa-monica-ca/', t: 'Santa Monica', d: 'Coastal homes that fight salt air.' },
        ],
      },
      { type: 'poster', kicker: 'Exterior Painting Estimate', h2: 'Curb Appeal That Survives the Summer', body: 'Free on-site estimate. We measure, look at the prep, and put the price in writing.' },
    ],
  },

  // ───────────────────────────── CABINETS ─────────────────────────────
  {
    slug: 'cabinet-painting',
    name: 'Cabinet Painting',
    title: "Cabinet Painting Tujunga & Los Angeles | Master's Pro Painting",
    description: `Kitchen and bathroom cabinet painting with a sprayed finish. No brush marks. Degreased, sanded and primed. 7-year guarantee. Free quote: ${SITE.phone}.`,
    hero: {
      variant: 'split-left',
      kicker: 'Cabinet Painting · Kitchens, Baths & Built-Ins',
      h1: 'Cabinet Painting in Tujunga, CA. New Kitchen Look. No Remodel.',
      lede: 'Keep your layout and your counters. We degrease, sand, prime and spray your cabinets for a smooth, hard finish. Kitchens, bathroom vanities, pantries and built-ins.',
      bullets: ['Sprayed Finish. No Brush Marks.', 'Kitchens, Vanities & Built-Ins', `${g}-Year Workmanship Guarantee`, `${SITE.rating} Stars on Google`],
      photo: '043',
      formTitle: 'Get your cabinet painting quote',
      service: 'Cabinet Painting',
      proofMeta: 'Kitchens · Vanities · Pantries<br>Bookcases · Built-ins',
    },
    sections: [
      { type: 'trust' },
      {
        type: 'split', kicker: 'Refinish or Replace?', h2: 'Most Kitchens Need New Color, Not New Boxes', photo: '042',
        paras: [
          'If your cabinet boxes are solid and the layout works, tearing them out means paying for demolition. Paint changes the whole room for a fraction of a remodel.',
          'White kitchens. Charcoal vanities. Gray pantry doors. Every photo on this page is a real cabinet job by our crew.',
          'Wobbly boxes or doors that will not close? Tell us on the walkthrough. We will tell you straight if something is too far gone to paint.',
        ],
      },
      {
        type: 'grid', kicker: 'Recent Cabinet Work', h2: 'Kitchens, Vanities and Pantries We Painted', bg: 'alt',
        tiles: [{ photo: '045', label: 'Charcoal vanity' }, { photo: '047', label: 'Pantry doors' }, { photo: '049', label: 'Base cabinets' }, { photo: '040', label: 'White uppers' }],
      },
      {
        type: 'checklist', kicker: 'The Process', h2: 'How We Paint Cabinets So the Finish Lasts', photo: '051', reverse: true,
        intro: 'Grease is what makes cabinet paint peel. So the first job is getting it off.',
        items: ['Doors and drawers removed and labeled', 'Kitchen masked in plastic so spray stays where it belongs', 'Every surface degreased', 'Sanded and primed for adhesion', 'Finish sprayed for a smooth, even coat', 'Doors rehung, hardware back on, kitchen cleaned'],
      },
      { type: 'reviews', kicker: 'Cabinet and Kitchen Reviews', h2: 'Clients Who Trusted Us With Their Kitchens', keys: ['heather', 'jose', 'molly'] },
      {
        type: 'price', kicker: 'Cabinet Painting Prices', h2: 'How Cabinet Painting Is Priced', pending: 'after a free walkthrough', bg: 'alt',
        factors: ['Number of doors, drawers and panels', 'Cabinet condition and repairs', 'Color change, like dark wood to white', 'Islands, vanities and built-ins added', 'Hardware swaps'],
        note: 'We count every door and drawer on the walkthrough and give you one written price. No surprises halfway through.',
      },
      { type: 'guarantee', photo: '052', body: `If the finish on cabinets we painted peels, flakes or loses adhesion because of our prep or spraying within ${g} years, we come back and fix it. Labor and paint included. Scratches, chips from use and countertops are not covered.` },
      {
        type: 'faq', h2: 'Cabinet Painting FAQ', intro: 'What people ask before they paint instead of replace.',
        items: [
          { q: 'How much does cabinet painting cost?', a: 'It depends on the number of doors and drawers, the condition of the boxes and the finish you want. We count it on a free walkthrough and give you a written price.' },
          { q: 'Will I see brush marks?', a: 'No. Cabinet finishes are sprayed. That is how you get the smooth look in these photos.' },
          { q: 'How long will my kitchen be out of action?', a: 'Doors and drawers come off and the kitchen gets masked while we spray. Your written quote spells out the schedule so you can plan meals around it.' },
          { q: 'Do you paint bathroom vanities and built-ins too?', a: 'Yes. Vanities, pantry doors, bookcases and built-ins get the same prep and the same sprayed finish.' },
          { q: 'Can you stain cabinets instead of painting them?', a: 'Yes. We also stain and refinish natural wood cabinets. One Google reviewer said the color came out perfect. See <a href="/staining-wood-refinishing/">staining and wood refinishing</a>.' },
        ],
      },
      { type: 'poster', kicker: 'Cabinet Painting Estimate', h2: 'See Your Kitchen in a New Color', body: 'Free walkthrough. We count every door, talk colors and put the price in writing.' },
      {
        type: 'links', kicker: 'Keep Going', h2: 'Finish the Room', intro: areaLinks,
        links: [
          { href: '/interior-painting/', t: 'Interior Painting', d: 'Walls and ceilings to match the new cabinets.' },
          { href: '/staining-wood-refinishing/', t: 'Staining & Wood Refinishing', d: 'For natural wood cabinets and doors.' },
          { href: '/drywall-repair/', t: 'Drywall Repair', d: 'Fix the wall damage from old backsplashes.' },
        ],
      },
    ],
  },

  // ───────────────────────────── COMMERCIAL ─────────────────────────────
  {
    slug: 'commercial-painting',
    name: 'Commercial Painting',
    title: "Commercial Painters Los Angeles | Clinics & Offices | Master's Pro",
    description: `Commercial painting for medical clinics, offices and retail across Los Angeles. Planned around your hours. Licensed, bonded and insured. ${SITE.phone}.`,
    hero: {
      variant: 'stacked',
      kicker: 'Commercial Painting · Los Angeles County',
      h1: 'Commercial Painting in Los Angeles. Clinics, Offices and Storefronts.',
      lede: 'Your business stays open. We plan the work around your hours, your staff and your customers, and we leave it clean before you open the doors.',
      bullets: ['Medical Clinics, Offices & Retail', `Licensed CA #${SITE.license}`, 'Bonded & Insured', 'Interior & Exterior'],
      photo: '079',
      formTitle: 'Request a commercial bid',
      service: 'Commercial Painting',
      proofMeta: 'Clinics · Offices · Retail<br>Interiors · Facades',
    },
    sections: [
      { type: 'pullquote', key: 'hugo', kicker: 'From a Repeat Clinic Client' },
      {
        type: 'split', kicker: 'Clinics and Offices', h2: 'Your Doors Stay Open While We Paint', photo: '001',
        paras: [
          'A medical office cannot shut down for a week. Neither can a storefront. So we plan the order of work with you before we start, so patients, staff and customers keep moving.',
          'One clinic group uses us for all of its sites and said so on Google. Repeat commercial work only happens when the job is clean, on schedule and done right the first time.',
          'Building exterior that needs a lift? Not a problem. The clinic facade on this page was repainted from one.',
        ],
        cta: 'Request a Commercial Bid →',
      },
      {
        type: 'checklist', kicker: 'What Commercial Clients Get', h2: 'Built for Businesses, Not Just Houses', photo: '072', bg: 'alt', reverse: true,
        items: ['A written scope and schedule before work starts', `Licensed, bonded and insured. CA license #${SITE.license}.`, 'Work areas protected and cleaned daily', 'Lobbies, exam rooms, offices, hallways and facades', 'Lift work for building exteriors', 'Final punch list walk with your manager'],
      },
      {
        type: 'grid', kicker: 'Commercial Work', h2: 'Offices and Clinics We Have Painted',
        tiles: [{ photo: '077', label: 'Office walls' }, { photo: '078', label: 'Window trim' }, { photo: '075', label: 'Wall prep' }, { photo: '073', label: 'In progress' }],
      },
      {
        type: 'steps', kicker: 'How a Commercial Job Runs', h2: 'Bid to Punch List in Four Steps', bg: 'alt',
        steps: [
          { t: 'Site Walk', b: 'We walk the space with you, measure, and learn how the building runs day to day.' },
          { t: 'Written Scope & Schedule', b: 'Surfaces, products, sequence and price in writing. Built around your operating hours.' },
          { t: 'Phased Work', b: 'Area by area, so the rooms you need stay open. Protected, cleaned and reset daily.' },
          { t: 'Punch List Walk', b: 'We walk it with your manager, fix what they flag, and hand the space back ready to use.' },
        ],
      },
      {
        type: 'price', kicker: 'Commercial Painting Prices', h2: 'How Commercial Painting Is Priced', pending: 'after a site walk',
        factors: ['Square footage and ceiling height', 'Access, lifts and after-hours needs', 'Surfaces: drywall, block, stucco, metal', 'Phasing around your schedule', 'Insurance and paperwork requirements'],
        note: 'Tell us your insurance requirements up front. We confirm them before we bid so there are no hold-ups at contract time.',
      },
      { type: 'guarantee', photo: '076' },
      {
        type: 'faq', h2: 'Commercial Painting FAQ', intro: 'For property managers, practice managers and business owners.',
        items: [
          { q: 'What kinds of commercial properties do you paint?', a: 'Medical clinics, offices, retail and small commercial buildings, inside and out. We do repeat work for a clinic group across its locations.' },
          { q: 'Can you work without shutting us down?', a: 'That is the plan on every commercial job. We map the order of work with you so the rooms you need stay usable.' },
          { q: 'Are you licensed and insured for commercial work?', a: `We are a licensed California contractor, license #${SITE.license}, C-33 Painting and Decorating, and we are bonded and insured. Send us your insurance requirements with your bid request so we can confirm them first.` },
          { q: 'Do you paint building exteriors that need a lift?', a: 'Yes. The clinic facade on this page was repainted from a lift.' },
          { q: 'How do you price commercial painting?', a: 'Per project, after a site walk. Square footage, access, surfaces and schedule all factor in. You get it in writing.' },
        ],
      },
      { type: 'reviews', kicker: 'Trusted on Bigger Jobs', h2: 'What Repeat Clients Say', keys: ['anthony', 'heather', 'shane'], bg: 'alt' },
      { type: 'poster', kicker: 'Commercial Bid Request', h2: 'Get Your Building on the Schedule', body: `Site walk, written scope and a price you can take to your manager. Call ${SITE.phone} or send the form.` },
    ],
  },

  // ───────────────────────────── STAINING & WOOD ─────────────────────────────
  {
    slug: 'staining-wood-refinishing',
    name: 'Staining & Wood Refinishing',
    title: "Wood Staining & Refinishing Tujunga, CA | Master's Pro Painting",
    description: `Wood staining and refinishing for kitchen cabinets, entry doors, beams, soffits, porches and railings. Licensed CA #${SITE.license}. 5.0 stars on Google. Free estimate: ${SITE.phone}.`,
    hero: {
      variant: 'split',
      kicker: 'Staining & Wood Refinishing · Inside and Out',
      h1: 'Wood Staining and Refinishing in Tujunga, CA. Bring the Grain Back.',
      lede: 'Kitchen cabinets, entry doors, ceiling beams, soffits, porches and railings. We prep, sand, stain and seal so wood looks like wood again.',
      bullets: ['Cabinets, Doors, Beams & Decks', 'Natural Wood Finishes', 'Licensed, Bonded & Insured', `${SITE.rating} Stars on Google`],
      photo: '018',
      formTitle: 'Get your wood refinishing quote',
      service: 'Staining & Wood Refinishing',
      proofMeta: 'Cabinets · Entry doors · Beams<br>Soffits · Porches · Railings',
    },
    sections: [
      { type: 'pullquote', key: 'jose', kicker: 'Cabinet Staining Review' },
      {
        type: 'grid', kicker: 'Wood We Have Refinished', h2: 'Soffits, Cabinets, Doors and Beams',
        tiles: [{ photo: '107', label: 'Stained soffit' }, { photo: '015', label: 'Kitchen cabinets' }, { photo: '016', label: 'Slatted door' }, { photo: '022', label: 'Ceiling beam' }],
      },
      {
        type: 'split', kicker: 'Porches, Soffits and Railings', h2: 'Outdoor Wood Takes the Hardest Hit', photo: '106', reverse: true, bg: 'alt',
        paras: [
          'Sun dries it. Rain soaks it. Foot traffic grinds it down. Porch steps and handrails need a finish that is prepped right and sealed.',
          'Eaves and soffits are easy to ignore until the finish goes gray and splits. Catch it early and refinishing costs far less than replacing boards.',
          'Inside, it is the opposite problem. Beams, built-ins and cabinets go dull and orange with age. A clean sand and a fresh stain brings the grain back.',
        ],
      },
      {
        type: 'checklist', kicker: 'The Process', h2: 'How We Refinish Wood', photo: '026',
        items: ['Hardware off. Doors removed where needed.', 'Walls, floors and counters masked', 'Old finish cleaned and sanded back', 'Stain color confirmed with you before we commit', 'Stain applied evenly, then sealed with a protective topcoat', 'Everything rehung and cleaned up'],
      },
      {
        type: 'price', kicker: 'Wood Refinishing Prices', h2: 'How Staining and Refinishing Is Priced', pending: 'after a free walkthrough', bg: 'alt',
        factors: ['Square footage of wood', 'Condition of the old finish', 'Going lighter vs going darker', 'Doors that come off and go on a stand', 'Exterior height and access'],
        note: 'Wood jobs vary more than paint jobs. We look first, then give you one written price.',
      },
      { type: 'reviews', kicker: 'Detail Work Reviews', h2: 'Clients Who Notice the Details', keys: ['anthony', 'kathy', 'karla'] },
      { type: 'guarantee', photo: '033', note: `Covered: vertical wood surfaces we prepare and finish. Not covered: decks, floors, steps, handrails and other horizontal or high-wear surfaces, because traffic and weather wear them no matter how good the prep is.` },
      {
        type: 'faq', h2: 'Staining and Wood Refinishing FAQ', intro: 'Stain or paint? Refinish or replace? Here are straight answers.',
        items: [
          { q: 'Should I stain or paint my kitchen cabinets?', a: 'Stain if you love wood grain and the wood is in good shape. Paint if you want a color change or the wood is patchy. We will tell you which one your cabinets can pull off. See <a href="/cabinet-painting/">cabinet painting</a>.' },
          { q: 'Do you refinish front doors?', a: 'Yes. Wood entry doors, slatted doors and paneled doors. Some come off and go on a work stand so every edge gets finished.' },
          { q: 'Do you stain exposed beams and soffits?', a: 'Yes. Ceiling beams inside, soffits and fascia outside. Both are on this page.' },
          { q: 'How often does exterior wood need refinishing?', a: 'It depends on sun and traffic. South and west facing wood and anything you walk on wears fastest. We will look and tell you honestly if yours needs it yet.' },
          { q: 'Is stained wood covered by your guarantee?', a: `Vertical surfaces we prepare and finish are covered by the ${g}-year workmanship guarantee. Decks, steps, handrails and other horizontal or high-wear surfaces are not. <a href="/7-year-guarantee/">Full terms</a>.` },
        ],
      },
      { type: 'poster', kicker: 'Wood Refinishing Estimate', h2: 'Make the Wood the Best Thing in the Room', body: 'Free on-site look. Honest advice on stain vs paint. Written price.' },
    ],
  },

  // ───────────────────────────── EPOXY ─────────────────────────────
  {
    slug: 'epoxy-flooring',
    name: 'Epoxy Garage Floors',
    title: "Epoxy Garage Floors Tujunga, CA | Master's Pro Painting",
    description: `Flake epoxy garage floors in Tujunga and Los Angeles. Concrete prepped so the coating bonds. Garage walls, ceilings and doors painted too. ${SITE.phone}.`,
    hero: {
      variant: 'banner',
      kicker: 'Epoxy Flooring · Garages & Work Rooms',
      h1: 'Epoxy Garage Floors in Tujunga, CA. Tough, Clean, Done Right.',
      lede: 'Flake epoxy floors for garages and work rooms. Prepped properly so the coating grips the concrete instead of lifting under your tires.',
      bullets: ['Flake Epoxy Finish', 'Garages & Work Rooms', 'Licensed, Bonded & Insured', '5-Star Epoxy Review on Google'],
      photo: '036',
      formTitle: 'Get your epoxy floor quote',
      service: 'Epoxy Garage Floor',
      proofMeta: 'Epoxy floors · Garage walls<br>Ceilings · Garage doors',
    },
    sections: [
      { type: 'pullquote', key: 'estefany', kicker: 'Epoxy Floor Review' },
      {
        type: 'split', kicker: 'Why Epoxy Peels', h2: 'Epoxy Is Only as Good as the Concrete Under It', photo: '038',
        paras: [
          'Most failed garage floors were rolled over dusty, oily or sealed concrete. They look great for a few months, then lift right where the tires sit.',
          'We clean and prep the slab first so the coating bonds. Edges and thresholds get masked clean. Then the flake goes down for a finish that hides dust and gives your feet some grip.',
          'No shortcuts on prep. That is what our epoxy reviewer called out first.',
        ],
        cta: 'Get My Epoxy Floor Quote →',
      },
      {
        type: 'grid', kicker: 'Epoxy and Garage Work', h2: 'Floors, Walls, Ceilings and Doors', bg: 'alt',
        tiles: [{ photo: '037', label: 'Flake floor' }, { photo: '058', label: 'Garage walls' }, { photo: '059', label: 'Ceiling work' }, { photo: '014', label: 'Garage door' }],
      },
      {
        type: 'checklist', kicker: 'Whole-Garage Makeover', h2: 'Do the Floor. Then Do the Rest.', photo: '057', reverse: true,
        intro: 'A new floor next to scuffed walls still looks like an old garage. We can paint the whole space in the same visit.',
        items: ['Flake epoxy floor', 'Walls and ceiling painted', 'Garage door painted', 'Drywall patched before paint', 'Doors, trim and shelving areas finished'],
      },
      {
        type: 'price', kicker: 'Epoxy Floor Prices', h2: 'How Epoxy Floors Are Priced', pending: 'after a free look at the slab', bg: 'alt',
        factors: ['Size of the slab', 'Cracks and chips that need repair', 'Oil stains and old coatings to remove', 'Flake choice', 'Walls, ceiling or door added'],
        note: 'We look at the concrete before we price it. If the slab has moisture problems, we tell you before you spend a dollar.',
      },
      { type: 'reviews', kicker: 'Garage and Home Projects', h2: 'Reviews From Garage Makeovers and More', keys: ['marybeth', 'ryan', 'jorge'] },
      { type: 'guarantee', photo: '035', note: 'Garage floors and other horizontal, high-wear surfaces are excluded from our workmanship guarantee. Painted garage walls, ceilings and doors are covered.' },
      {
        type: 'faq', h2: 'Epoxy Garage Floor FAQ', intro: 'What to know before you coat your garage floor.',
        items: [
          { q: 'How much does an epoxy garage floor cost?', a: 'The size and condition of the slab set the price. Cracks and oil stains add prep. You get a written quote after a free look.' },
          { q: 'Can you coat a floor with cracks or stains?', a: 'Often, yes. Cracks get repaired and stains get cleaned as part of prep. If the slab has moisture problems, we will tell you first.' },
          { q: 'Is epoxy covered by your 7-year guarantee?', a: 'No. Garage floors and other horizontal, high-wear surfaces are excluded from our workmanship guarantee. The walls, ceiling and door we paint in the garage are covered.' },
          { q: 'Do you do epoxy in rooms other than garages?', a: 'Yes. Work rooms and utility spaces too. Tell us about the space when you request your estimate.' },
          { q: 'Can you paint the rest of the garage too?', a: 'Yes. Walls, ceiling, trim and the garage door, often in the same visit. One of our reviewers had us turn a garage into a bonus room.' },
        ],
      },
      { type: 'poster', kicker: 'Epoxy Floor Estimate', h2: 'Pull Into a Garage You Are Proud Of', body: 'Free look at your slab. Straight advice. Written price.' },
    ],
  },

  // ───────────────────────────── DRYWALL ─────────────────────────────
  {
    slug: 'drywall-repair',
    name: 'Drywall Repair',
    title: "Drywall Repair & Painting Tujunga, CA | Master's Pro Painting",
    description: `Drywall repair and painting in one job. Holes, cracks, water-stained ceilings and old fixture openings patched and painted to blend. Licensed CA #${SITE.license}. ${SITE.phone}.`,
    hero: {
      variant: 'split-left',
      kicker: 'Drywall Repair · Walls & Ceilings',
      h1: 'Drywall Repair and Painting in Tujunga, CA. Patch It. Paint It. Gone.',
      lede: 'Holes, cracks, water-stained ceilings, and old fixture openings. We repair the drywall and paint it to blend, so you hire one crew instead of two.',
      bullets: ['Walls & Ceilings', 'One Crew for Repair and Paint', 'Licensed, Bonded & Insured', `${SITE.rating} Stars on Google`],
      photo: '071',
      formTitle: 'Get your drywall repair quote',
      service: 'Drywall Repair',
      proofMeta: 'Holes · Cracks · Ceiling patches<br>Water stains · Fixture openings',
    },
    sections: [
      {
        type: 'split', kicker: 'One Crew, Not Two', h2: 'Why Hire Two Trades for One Wall?', photo: '066',
        paras: [
          'The drywall guy patches it. The painter shows up a week later. Then the patch flashes through the new paint like a spotlight. Sound familiar?',
          'We do both. Patch, sand, prime and paint in one job, so the repair disappears into the wall instead of sitting on top of it.',
          'Old recessed light holes. Ceiling cracks. Doorknob dents. Patched plumbing access. All of it.',
        ],
        cta: 'Get My Repair Quote →',
      },
      {
        type: 'grid', kicker: 'Repair Work', h2: 'Patched, Primed and Painted', bg: 'alt',
        tiles: [{ photo: '069', label: 'Joints & openings' }, { photo: '067', label: 'Finished bedroom' }, { photo: '070', label: 'Fresh walls' }, { photo: '062', label: 'Ceiling work' }],
      },
      { type: 'reviews', kicker: 'Repairs and Repaints', h2: 'Clients Who Hired Us for Repairs', keys: ['shane', 'marybeth', 'leslie'] },
      {
        type: 'checklist', kicker: 'The Process', h2: 'How a Repair Job Runs', photo: '068', reverse: true,
        items: ['Furniture and floors covered', 'Damaged drywall cut out or patched', 'Joints taped and mudded', 'Sanded smooth and primed so the patch does not flash', 'Painted to blend with the wall or ceiling', 'Dust cleaned up before we leave'],
      },
      {
        type: 'price', kicker: 'Drywall Repair Prices', h2: 'How Drywall Repair Is Priced', pending: 'after a free look', bg: 'alt',
        factors: ['Number and size of repairs', 'Ceilings vs walls', 'Water damage that needs cutting out', 'Texture on the surrounding wall', 'Repainting the full wall or ceiling to blend'],
        note: 'Adding repairs to an interior repaint usually makes the most sense. Ask us to quote them together.',
      },
      { type: 'guarantee', photo: '065', note: 'New cracks from the house settling, and damage from leaks, are not workmanship failures and are not covered.' },
      {
        type: 'faq', h2: 'Drywall Repair FAQ', intro: 'Quick answers before you book a patch job.',
        items: [
          { q: 'Can you fix water-stained ceilings?', a: 'Yes, once the leak is fixed. We repair or replace the damaged drywall, seal the stain so it does not bleed through, and repaint. Fix the leak first or the stain comes back.' },
          { q: 'Will I be able to see the patch?', a: 'The goal is no. Priming the patch and painting out the whole wall or ceiling section, not just a square around it, is how you avoid a visible spot.' },
          { q: 'How much does drywall repair cost?', a: 'It is priced per job based on the number and size of repairs. Adding them to an interior repaint is usually the best value.' },
          { q: 'Is drywall repair covered by the guarantee?', a: 'Our guarantee covers paint failure from our prep or application. New cracks caused by the house settling, or damage from leaks, are not covered.' },
          { q: 'Do you paint the whole room after a repair?', a: 'Only if you want us to. Sometimes one wall is enough. We will show you where the blend line needs to be. See <a href="/interior-painting/">interior painting</a>.' },
        ],
      },
      { type: 'poster', kicker: 'Drywall Repair Estimate', h2: 'Make the Damage Disappear', body: 'Free look. Repair and paint priced together. One crew, one visit.' },
      {
        type: 'links', kicker: 'Related Services', h2: 'While We Are There', intro: areaLinks,
        links: [
          { href: '/interior-painting/', t: 'Interior Painting', d: `${PRICES.interior.low} to ${PRICES.interior.high} per sq ft.` },
          { href: '/cabinet-painting/', t: 'Cabinet Painting', d: 'Sprayed finish, no brush marks.' },
          { href: '/epoxy-flooring/', t: 'Epoxy Garage Floors', d: 'Flake epoxy for garages and work rooms.' },
        ],
      },
    ],
  },
];
