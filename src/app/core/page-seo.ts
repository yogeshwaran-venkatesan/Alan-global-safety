import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from './seo';

export type Translate = (key: string) => string;

export interface PageSeoOptions {
  image?: string;
  noindex?: boolean;
  /** schema.org objects for this page, built with English copy. */
  structuredData?: (t: Translate) => object[];
}

/** Call from a page constructor: SEO copy comes from i18n keys `seo.<key>.title|description`. */
export function pageSeo(key: string, path: string, options: PageSeoOptions = {}): void {
  const translate = inject(TranslateService);
  const t: Translate = (k) => translate.instant(k);
  inject(SeoService).set({
    title: t(`seo.${key}.title`),
    description: t(`seo.${key}.description`),
    path,
    image: options.image,
    noindex: options.noindex,
    structuredData: options.structuredData?.(t),
  });
}
