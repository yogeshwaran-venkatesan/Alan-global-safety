/**
 * Every company fact lives here so the site can be updated without touching
 * components. Items marked CONFIRM are written for the pitch and must be
 * checked with the client before going live.
 */
export const COMPANY = {
  name: 'Alan Global Safety',
  shortName: 'Alan Global',
  /** From the company brochure: "Having 25 years experience in safety field". */
  experienceYears: 25,
  /** Training programmes conducted, from the brochure. */
  inHouseTrainings: 1000,
  centralizedTrainings: 100,
  ceo: { name: 'RK Parthikumar', role: 'Chief Executive Officer' },
  /** Head office (Kochi). Kept as `address` because the footer, contact page and SEO read it. */
  address: {
    line1: 'Door No: 2219, Kalladaayithadam Building',
    line2: 'Near T.V Center, CSEZ Post',
    area: 'Kakkanad',
    city: 'Ernakulam',
    state: 'Kerala',
    pin: '682037',
  },
  phones: [
    { label: '+91 87142 67507', href: 'tel:+918714267507' },
    { label: '+91 78459 02100', href: 'tel:+917845902100' },
  ],
  emails: { info: 'info@alanglobalsafety.com', training: 'training@alanglobalsafety.com' },
  whatsapp: '918714267507',
  /** Product catalogue PDF (copied from the current site into public/). */
  brochureUrl: '/alan-global-safety-catalogue.pdf',
  /** TODO: free Web3Forms access key so enquiries are also emailed (web3forms.com). */
  web3formsKey: 'YOUR-WEB3FORMS-ACCESS-KEY',
  mapsQuery: 'Kalladaayithadam Building, Near TV Center, CSEZ, Kakkanad, Ernakulam 682037',
} as const;

export interface Office {
  key: 'kochi' | 'coimbatore';
  lines: string[];
  phones: { label: string; href: string }[];
  email: string;
  gstin: string;
  mapsQuery: string;
}

/** Both offices, as printed on the back of the brochure. */
export const OFFICES: Office[] = [
  {
    key: 'kochi',
    lines: ['Door No: 2219, Kalladaayithadam Building', 'Near T.V Center, CSEZ Post, Kakkanad', 'Ernakulam – 682037, Kerala'],
    phones: [...COMPANY.phones],
    email: COMPANY.emails.info,
    gstin: '32AWYPP7470R1Z9',
    mapsQuery: COMPANY.mapsQuery,
  },
  {
    key: 'coimbatore',
    lines: ['40/4B, Shop #3, Thiruchendur Murugan Complex', 'Palani Goundan Pudur, Virundheeswarar Nagar', 'Pannimadai Road, K. Vadamadurai (Post)', 'Coimbatore – 641017, Tamil Nadu'],
    phones: [COMPANY.phones[0]],
    email: 'rkp@alanglobalsafety.com',
    gstin: '33AWYPP7470R1Z7',
    mapsQuery: 'Thiruchendur Murugan Complex, Pannimadai Road, K. Vadamadurai, Coimbatore 641017',
  },
];

export const officeDirectionsUrl = (o: Office): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(o.mapsQuery)}`;

export const whatsappUrl = (message: string): string =>
  `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(message)}`;

export const mapsEmbedUrl = (): string => `https://www.google.com/maps?q=${encodeURIComponent(COMPANY.mapsQuery)}&output=embed`;

export const mapsDirectionsUrl = (): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(COMPANY.mapsQuery)}`;

/* ------------------------------------------------------------------ */
/* Product catalogue                                                   */
/* ------------------------------------------------------------------ */

export type ProductGroupId = 'ppe' | 'footwear' | 'height' | 'fire' | 'emergency' | 'spill' | 'detection' | 'site';

export interface ProductGroup {
  id: ProductGroupId;
  icon: string;
}

export const PRODUCT_GROUPS: ProductGroup[] = [
  { id: 'ppe', icon: 'helmet' },
  { id: 'footwear', icon: 'boot' },
  { id: 'height', icon: 'harness' },
  { id: 'fire', icon: 'hydrant' },
  { id: 'emergency', icon: 'firstAid' },
  { id: 'spill', icon: 'sorbent' },
  { id: 'detection', icon: 'detector' },
  { id: 'site', icon: 'cone' },
];

export interface ProductCategory {
  /** URL slug, i18n key under "products.categories" and key into CATALOG. */
  slug: string;
  group: ProductGroupId;
  icon: string;
  /** Cover photo: one of the section's products from the brochure. */
  image: string;
}

const cover = (slug: string, id: string) => `images/catalog/${slug}/${id}.webp`;
const cat = (slug: string, group: ProductGroupId, icon: string, coverId: string): ProductCategory => ({ slug, group, icon, image: cover(slug, coverId) });

/** The 29 sections of the company brochure, in brochure order within each group. */
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  cat('head-protection', 'ppe', 'helmet', 'airvent-helmet'),
  cat('eye-protection', 'ppe', 'goggles', 'chemical-splash-goggles-3m1621'),
  cat('ear-protection', 'ppe', 'earmuff', 'earmuff-3m-h9a'),
  cat('respiratory-protection', 'ppe', 'mask', '3m-8210'),
  cat('face-respirators', 'ppe', 'mask', '3m-6800-full-face'),
  cat('airline-respiratory', 'ppe', 'airline', 'abrasive-blasting-hood'),
  cat('hand-protection', 'ppe', 'glove', 'impact-resistant-gloves'),
  cat('body-protection', 'ppe', 'vest', 'fr-coverall'),
  cat('welding-safety', 'ppe', 'weld', 'helmet-attached-welding-shield'),
  cat('safety-shoes-allen-cooper', 'footwear', 'boot', 'allen-cooper-ac-1284'),
  cat('safety-shoes-acme', 'footwear', 'boot', 'acme-tan-x'),
  cat('safety-jogger', 'footwear', 'boot', 'safety-jogger-modulo-s3s-high-ankle'),
  cat('coffer-safety', 'footwear', 'boot', 'coffer-1163-pu-with-nitrile-rubber-sole'),
  cat('other-safety-shoes', 'footwear', 'boot', 'jcb-high-ankle'),
  cat('fall-protection', 'height', 'harness', 'tower-climbing-harness'),
  cat('fall-arresters-ladders', 'height', 'ladder', 'pn-800-tripod'),
  cat('fire-extinguishers', 'fire', 'flame', 'abc-fire-extinguisher'),
  cat('fire-hydrant', 'fire', 'hydrant', 'hose-reel-drum'),
  cat('emergency-rescue', 'fire', 'siren', 'scba-self-contained-breathing-apparatus'),
  cat('first-aid', 'emergency', 'firstAid', 'first-aid-box'),
  cat('eyewash-shower', 'emergency', 'eyewash', 'portable-eye-wash'),
  cat('sorbents-spill-kits', 'spill', 'sorbent', 'oil-spill-kit'),
  cat('safety-cans-cabinets', 'spill', 'cabinet', 'safety-can-type-ii'),
  cat('gas-detection', 'detection', 'detector', 'riken-keiki-gx-3r'),
  cat('safe-lighting', 'detection', 'flashlight', 'pelican-9435'),
  cat('traffic-safety', 'site', 'cone', 'multipurpose-traffic-cone-with-link-chain'),
  cat('safety-signage', 'site', 'sign', 'auto-glow-signages'),
  cat('electrical-safety', 'site', 'bolt', 'arc-flash-face-shield'),
  cat('lockout-tagout', 'site', 'lockout', 'lockout-station'),
];

export { CATALOG, catalogItem, catalogItems, PRODUCT_COUNT } from './catalog.data';
export type { CatalogItem } from './catalog.data';

/** Photos from the client's current site, used as atmosphere in heroes and section bands. */
export const PHOTOS = {
  ppeFlatlay: 'images/photos/ppe-flatlay.webp',
  workerMask: 'images/photos/worker-mask.webp',
  firefighter: 'images/photos/firefighter.webp',
  refinery: 'images/photos/refinery-hand.webp',
  engineer: 'images/photos/engineer.webp',
  ppeBanner: 'images/photos/ppe-banner.webp',
  helmetHands: 'images/photos/helmet-hands.webp',
  /** CONFIRM name and role with the client before publishing. */
  founder: 'images/photos/founder.webp',
  /** The company's logo badge (updated logo supplied by the client). */
  clientLogo: 'images/logo/logo-1024.webp',
  /** PNG copy for search engines and structured data. */
  logoPng: 'images/logo/logo-512.png',
} as const;

/* ------------------------------------------------------------------ */
/* Training programmes — full data in trainings.config.ts               */
/* ------------------------------------------------------------------ */

export { TRAININGS } from './trainings.config';
import { TRAININGS } from './trainings.config';

/** First six programmes, shown on the home page. */
export const FEATURED_TRAININGS = TRAININGS.slice(0, 6);
export const TRAINING_COUNT = TRAININGS.length;

export const categoryBySlug = (slug: string): ProductCategory | undefined => PRODUCT_CATEGORIES.find((c) => c.slug === slug);
