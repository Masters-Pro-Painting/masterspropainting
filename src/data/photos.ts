import type { ImageMetadata } from 'astro';

// Real client job photos from the organized photo pack (IMAGE-INDEX.csv).
// Keyed by the 3-digit image id. Alt text describes what is visible only:
// no suburbs, no invented before/after pairs, in-progress shots are labeled
// as prep or in progress. Photo 009 is excluded (homeowner family photos).

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.jpg', { eager: true });

const byId: Record<string, ImageMetadata> = {};
for (const [path, mod] of Object.entries(files)) {
  const id = path.match(/-(\d{3})\.jpg$/)?.[1];
  if (id) byId[id] = mod.default;
}

export const ALT: Record<string, string> = {
  '001': "Master's Pro Painting crew on a lift repainting a medical clinic facade",
  '002': 'Painter prepping a paneled interior room for paint',
  '003': 'Decorative wall panels masked and prepped with the floor covered',
  '004': 'Open-plan dining room and kitchen with freshly painted white walls',
  '005': 'Dining room with large windows and freshly painted walls',
  '006': 'Ornate metal staircase railing masked off for painting',
  '007': 'Commercial interior with a dark feature wall, wood slats and shelving',
  '008': "The Master's Pro Painting crew outside a building",
  '010': 'Arched wood double entry doors during refinishing prep',
  '011': 'Arched double entry doors painted red',
  '012': 'Light-colored home exterior with painted window trim',
  '013': 'Freshly painted white garden cottage exterior with French doors and patio',
  '014': 'Repainted stucco building with a black garage door',
  '015': 'Natural wood stained kitchen cabinets beside the refrigerator',
  '016': 'Slatted wood entry door with a natural wood finish, inside view',
  '017': 'Natural wood upper kitchen cabinet detail',
  '018': 'Natural wood stained kitchen cabinets, wide view',
  '019': 'Stained wood soffit and fascia on a home exterior corner',
  '020': 'Stained exterior wood soffit seen from below',
  '021': 'Floating wood shelves with the wall masked for finishing',
  '022': 'Stained exposed wood ceiling beam detail',
  '023': 'Paneled wood door on a work stand during refinishing',
  '024': 'Light wood exterior soffit during finish prep',
  '025': 'Small gabled building exterior during painting',
  '026': 'Wood kitchen cabinets with doors removed for refinishing',
  '027': 'Kitchen cabinet boxes prepped with doors removed, wide view',
  '028': 'Stained wood porch steps, deck and handrails',
  '029': "Two members of the Master's Pro Painting team at a paint store event",
  '030': "The Master's Pro Painting team at a paint store event",
  '031': "Four members of the Master's Pro Painting team at a paint store",
  '032': 'Painter refinishing wood built-in shelves around a fireplace',
  '033': 'Room with stained exposed wood ceiling beams',
  '034': 'Slatted wood entry door, outside view, during refinishing',
  '035': 'Gray flake epoxy floor seen through a doorway',
  '036': 'Gray flake epoxy garage floor, wide view',
  '037': 'Gray flake epoxy floor beside a window',
  '038': 'Gray flake epoxy floor with the threshold masked',
  '039': 'White bathroom vanity mid-paint with the mirror masked',
  '040': 'White painted upper cabinets under a wood ceiling',
  '041': 'White painted kitchen drawer detail',
  '042': 'White painted kitchen cabinets with black countertops',
  '043': 'White painted kitchen cabinets and island, wide view',
  '044': 'White kitchen base and upper cabinets during painting',
  '045': 'Charcoal painted bathroom vanity',
  '046': 'Gray painted bathroom vanity and storage cabinet',
  '047': 'Gray painted pantry doors with white shelves, angle view',
  '048': 'Gray painted pantry doors with white shelves',
  '049': 'Gray painted base cabinets with a wood countertop',
  '050': 'White kitchen cabinets with doors removed for painting',
  '051': 'Kitchen masked in plastic for cabinet spraying',
  '052': 'Gray painted double-sink bathroom vanity',
  '053': 'White built-in cabinets with glass doors, floor masked',
  '054': 'Painter working on a white built-in bookcase',
  '055': 'Painter beside red painted pantry cabinets',
  '056': 'Red painted pantry cabinets with a painter at work, wide view',
  '057': 'Garage ceiling being painted, wide view',
  '058': 'Freshly painted garage walls and ceiling',
  '059': 'Garage ceiling paint application close-up',
  '060': 'Entry hall and staircase with freshly painted walls and trim',
  '061': 'White kitchen island with floor protection in place',
  '062': 'Breakfast room ceiling and windows during painting',
  '063': 'Empty alcove with fresh white walls over a wood floor',
  '064': 'Recessed wall niche prepped with the floor protected',
  '065': 'Freshly painted bedroom window recess and trim',
  '066': 'Drywall patches on a bedroom window wall and ceiling',
  '067': 'Bedroom with freshly painted walls and recessed lights',
  '068': 'Ceiling drywall patches with the furniture covered',
  '069': 'Drywall joints and ceiling openings patched around a window',
  '070': 'Empty room with fresh white walls, door view',
  '071': 'Empty room with fresh white walls, wide view',
  '072': 'Painter prepping office walls',
  '073': 'Office with gray walls during painting',
  '074': 'Painter prepping walls in a small commercial room',
  '075': 'Crew prepping walls in a small commercial room, wide view',
  '076': 'Finished white office room after a repaint',
  '077': 'Office with muted green painted walls',
  '078': 'Painter working on office window trim',
  '079': 'Medical clinic facade repaint with a lift, street view',
  // Exterior batch. 102 has the house number blurred. 110 and 111 are in-progress shots.
  '101': 'White lap siding home with dark green shutters and a white entry door',
  '102': 'Spanish-style home repainted in charcoal gray stucco with white window trim',
  '103': 'Gray stucco front porch with crisp white window trim',
  '104': 'Gray stucco side wall with freshly painted white window trim',
  '105': 'White stucco home with dark painted carport posts and fascia',
  '106': 'Stained wood pergola ceiling over a modern patio',
  '107': 'Stained wood soffit on a modern home with scaffolding still up',
  '108': 'White painted brick wall beside gray stairs and white railings',
  '109': "Master's Pro Painting crew on a ladder painting window shutters",
  '110': 'Hillside home mid-repaint in charcoal siding',
  '111': 'Dark window frame masked off for refinishing',
  '112': "Master's Pro crew spraying a paneled stairwell with the room sealed in plastic",
  '113': 'Finished living room with a vaulted beamed ceiling and a stone fireplace',
};

export function photo(id: string): { src: ImageMetadata; alt: string } {
  const src = byId[id];
  if (!src) throw new Error(`Photo ${id} not found in src/assets/photos`);
  return { src, alt: ALT[id] ?? '' };
}

// Every service, area and landing page must show exactly this many distinct
// photos. Photos can repeat across pages, never within one.
export const PHOTOS_PER_PAGE = 8;
export function assertPhotoSet(page: string, ids: string[]) {
  const unique = new Set(ids);
  if (ids.length !== PHOTOS_PER_PAGE || unique.size !== ids.length) {
    throw new Error(`${page}: needs ${PHOTOS_PER_PAGE} distinct photos, got ${ids.length} (${unique.size} unique): ${ids.join(',')}`);
  }
  for (const id of ids) photo(id);
}
