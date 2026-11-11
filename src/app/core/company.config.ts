/**
 * Every company fact lives here so the site can be updated without touching
 * components. Items marked CONFIRM are written for the pitch and must be
 * checked with the client before going live.
 */
export const COMPANY = {
  name: 'Alan Global Safety',
  shortName: 'Alan Global',
  /** From the current site: "21 years experience in safety field". */
  experienceYears: 21,
  address: {
    line1: '103-B, First Floor, PSARA',
    line2: 'Opp. Padamugal U.P. School Road, Near Sariga Club',
    area: 'Thanapadam, Kakkanad P.O.',
    city: 'Ernakulam',
    state: 'Kerala',
    pin: '682030',
  },
  phones: [
    { label: '+91 87142 67507', href: 'tel:+918714267507' },
    { label: '+91 87140 58108', href: 'tel:+918714058108' },
  ],
  emails: { info: 'info@alanglobalsafety.com', training: 'training@alanglobalsafety.com' },
  whatsapp: '918714267507',
  /** Product catalogue PDF (copied from the current site into public/). */
  brochureUrl: '/alan-global-safety-catalogue.pdf',
  /** TODO: free Web3Forms access key so enquiries are also emailed (web3forms.com). */
  web3formsKey: 'YOUR-WEB3FORMS-ACCESS-KEY',
  mapsQuery: 'Alan Global Safety, Thanapadam, Kakkanad, Ernakulam 682030',
} as const;

export const whatsappUrl = (message: string): string =>
  `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(message)}`;

export const mapsEmbedUrl = (): string => `https://www.google.com/maps?q=${encodeURIComponent(COMPANY.mapsQuery)}&output=embed`;

export const mapsDirectionsUrl = (): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(COMPANY.mapsQuery)}`;

/* ------------------------------------------------------------------ */
/* Product catalogue                                                   */
/* ------------------------------------------------------------------ */

export type ProductGroupId = 'ppe' | 'height' | 'emergency' | 'spill' | 'detection' | 'site';

export interface ProductGroup {
  id: ProductGroupId;
  icon: string;
}

/** Categories are grouped so 19 items stay easy to scan (mega-menu, catalogue filters). */
export const PRODUCT_GROUPS: ProductGroup[] = [
  { id: 'ppe', icon: 'helmet' },
  { id: 'height', icon: 'harness' },
  { id: 'emergency', icon: 'firstAid' },
  { id: 'spill', icon: 'sorbent' },
  { id: 'detection', icon: 'detector' },
  { id: 'site', icon: 'cone' },
];

export interface ProductCategory {
  /** URL slug and i18n key under "products.categories". */
  slug: string;
  group: ProductGroupId;
  icon: string;
  /** Product photo from the client's current site (public/images/products). */
  image: string;
  /** Brands named on the current site. */
  brands?: string[];
  /** Extra product photos shown on the category page (label = i18n key or brand name). */
  gallery?: { src: string; label: string }[];
}

const img = (name: string) => `images/products/${name}.webp`;

/**
 * The categories on the current site and its media library (the three
 * safety-shoe entries are merged into one "Safety footwear" category with its
 * brands; welding safety, signage and safe lighting come from uploaded photos).
 * Descriptions and typical items in the i18n files are CONFIRM.
 */
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { slug: 'head-protection', group: 'ppe', icon: 'helmet', image: img('head-protection') },
  { slug: 'eye-protection', group: 'ppe', icon: 'goggles', image: img('eye-protection') },
  { slug: 'ear-protection', group: 'ppe', icon: 'earmuff', image: img('ear-protection') },
  {
    slug: 'respiratory-protection', group: 'ppe', icon: 'mask', image: img('respiratory-protection'),
    gallery: [{ src: img('respirators-half-full'), label: 'products.gallery.halfFull' }],
  },
  { slug: 'airline-respirators', group: 'ppe', icon: 'airline', image: img('airline-respirators') },
  { slug: 'hand-protection', group: 'ppe', icon: 'glove', image: img('hand-protection') },
  { slug: 'body-protection', group: 'ppe', icon: 'vest', image: img('body-protection') },
  { slug: 'welding-safety', group: 'ppe', icon: 'weld', image: img('welding-safety') },
  {
    slug: 'safety-footwear', group: 'ppe', icon: 'boot', image: img('shoe-allen-cooper'), brands: ['Allen Cooper', 'Acme'],
    gallery: [
      { src: img('shoe-allen-cooper'), label: 'Allen Cooper' },
      { src: img('shoe-acme'), label: 'Acme' },
      { src: img('shoe-other'), label: 'products.gallery.otherBrands' },
    ],
  },
  { slug: 'fall-protection', group: 'height', icon: 'harness', image: img('fall-protection') },
  { slug: 'fall-arresters-ladders', group: 'height', icon: 'ladder', image: img('fall-arresters-ladders') },
  { slug: 'first-aid', group: 'emergency', icon: 'firstAid', image: img('first-aid') },
  { slug: 'eye-wash-shower', group: 'emergency', icon: 'eyewash', image: img('eye-wash-shower') },
  { slug: 'emergency-rescue', group: 'emergency', icon: 'tripod', image: img('emergency-rescue') },
  { slug: 'spill-control', group: 'spill', icon: 'sorbent', image: img('spill-control') },
  { slug: 'safety-cans-cabinets', group: 'spill', icon: 'cabinet', image: img('safety-cans-cabinets') },
  { slug: 'gas-detection', group: 'detection', icon: 'detector', image: img('gas-detection') },
  { slug: 'safe-lighting', group: 'detection', icon: 'flashlight', image: img('safe-lighting') },
  { slug: 'traffic-safety', group: 'site', icon: 'cone', image: img('traffic-safety') },
  { slug: 'safety-signage', group: 'site', icon: 'sign', image: img('safety-signage') },
  { slug: 'electrical-safety', group: 'site', icon: 'bolt', image: img('electrical-safety') },
  { slug: 'lockout-tagout', group: 'site', icon: 'lockout', image: img('lockout-tagout') },
];

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
  clientLogo: 'images/client-logo.png',
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
