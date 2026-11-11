import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { COMPANY } from './company.config';
import { SITE_URL } from './site-url';

export { SITE_URL };

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
  /** schema.org objects for this page, emitted as one JSON-LD @graph. */
  structuredData?: object[];
}

const JSON_LD_ID = 'page-structured-data';

export const absoluteUrl = (path: string): string => SITE_URL + (path.startsWith('/') ? path : '/' + path);

/** Title, description, canonical, Open Graph / Twitter and JSON-LD — set at prerender time. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  set(page: PageMeta): void {
    const fullTitle = page.path === '/' ? page.title : `${page.title} | ${COMPANY.name}`;
    const url = absoluteUrl(page.path);
    const image = absoluteUrl(page.image ?? 'og-cover.png');

    this.title.setTitle(fullTitle);
    const tags: Record<string, string>[] = [
      { name: 'description', content: page.description },
      { name: 'robots', content: page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: COMPANY.name },
      { property: 'og:locale', content: 'en_IN' },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: page.description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: page.description },
      { name: 'twitter:image', content: image },
    ];
    for (const tag of tags) this.meta.updateTag(tag);

    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;

    this.document.getElementById(JSON_LD_ID)?.remove();
    if (page.structuredData?.length) {
      const script = this.document.createElement('script');
      script.id = JSON_LD_ID;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': page.structuredData }).replace(/</g, '\\u003c');
      this.document.head.appendChild(script);
    }
  }
}
