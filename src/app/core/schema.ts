import { COMPANY, OFFICES, PHOTOS } from './company.config';
import { absoluteUrl } from './seo';

const ORG_ID = () => absoluteUrl('/#organization');

/** The company as a schema.org Organization (referenced by @id from other pages). */
export const organizationSchema = (description: string): object => ({
  '@type': 'Organization',
  '@id': ORG_ID(),
  name: COMPANY.name,
  url: absoluteUrl('/'),
  logo: absoluteUrl(PHOTOS.logoPng),
  description,
  slogan: 'Being Safety Today — Hello Tomorrow',
  email: COMPANY.emails.info,
  telephone: COMPANY.phones.map((p) => p.href.replace('tel:', '')),
  founder: { '@type': 'Person', name: COMPANY.ceo.name, jobTitle: COMPANY.ceo.role },
  areaServed: ['Kerala', 'Tamil Nadu', 'India'],
});

const ADDRESS: Record<string, object> = {
  kochi: { streetAddress: 'Door No: 2219, Kalladaayithadam Building, Near T.V Center, CSEZ Post, Kakkanad', addressLocality: 'Ernakulam', addressRegion: 'Kerala', postalCode: '682037', addressCountry: 'IN' },
  coimbatore: { streetAddress: '40/4B, Shop #3, Thiruchendur Murugan Complex, Palani Goundan Pudur, Virundheeswarar Nagar, Pannimadai Road, K. Vadamadurai (Post)', addressLocality: 'Coimbatore', addressRegion: 'Tamil Nadu', postalCode: '641017', addressCountry: 'IN' },
};

/** Both offices as LocalBusiness entries, linked to the Organization. */
export const officesSchema = (): object[] =>
  OFFICES.map((o) => ({
    '@type': 'LocalBusiness',
    '@id': absoluteUrl(`/contact#${o.key}`),
    name: `${COMPANY.name} — ${o.key === 'kochi' ? 'Kochi' : 'Coimbatore'}`,
    parentOrganization: { '@id': ORG_ID() },
    url: absoluteUrl('/contact'),
    image: absoluteUrl(PHOTOS.logoPng),
    telephone: o.phones.map((p) => p.href.replace('tel:', '')),
    email: o.email,
    taxID: o.gstin,
    address: { '@type': 'PostalAddress', ...ADDRESS[o.key] },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.mapsQuery)}`,
  }));
