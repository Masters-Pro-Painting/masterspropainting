// Service areas approved in the design handoff (Foothills / Valley / Westside).
export const AREA_INDEX = [
  { slug: 'tujunga-ca', city: 'Tujunga', region: 'Foothills' },
  { slug: 'sunland-ca', city: 'Sunland', region: 'Foothills' },
  { slug: 'la-crescenta-ca', city: 'La Crescenta', region: 'Foothills' },
  { slug: 'la-canada-flintridge-ca', city: 'La Cañada Flintridge', region: 'Foothills' },
  { slug: 'burbank-ca', city: 'Burbank', region: 'San Fernando Valley' },
  { slug: 'glendale-ca', city: 'Glendale', region: 'San Fernando Valley' },
  { slug: 'north-hollywood-ca', city: 'North Hollywood', region: 'San Fernando Valley' },
  { slug: 'sherman-oaks-ca', city: 'Sherman Oaks', region: 'San Fernando Valley' },
  { slug: 'hollywood-hills-ca', city: 'Hollywood Hills', region: 'Westside' },
  { slug: 'santa-monica-ca', city: 'Santa Monica', region: 'Westside' },
  { slug: 'venice-ca', city: 'Venice', region: 'Westside' },
  { slug: 'west-los-angeles-ca', city: 'West Los Angeles', region: 'Westside' },
] as const;

export const areaHref = (slug: string) => `/service-areas/${slug}/`;
export const REGIONS = ['Foothills', 'San Fernando Valley', 'Westside'] as const;
