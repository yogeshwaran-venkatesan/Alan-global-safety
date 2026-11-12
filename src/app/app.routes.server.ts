import { RenderMode, ServerRoute } from '@angular/ssr';
import { DETAIL_PRODUCTS, PRODUCT_CATEGORIES } from './core/company.config';
import { TRAININGS } from './core/trainings.config';

/** Static site: every route — including one page per product category — is prerendered. */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/:slug/:item',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => DETAIL_PRODUCTS.map((p) => ({ slug: p.section, item: p.item.id })),
  },
  {
    path: 'products/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => PRODUCT_CATEGORIES.map((c) => ({ slug: c.slug })),
  },
  {
    path: 'trainings/:key',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => TRAININGS.map((t) => ({ key: t.key })),
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
