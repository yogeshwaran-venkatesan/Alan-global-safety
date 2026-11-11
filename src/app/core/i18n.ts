import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TranslateLoader, TranslateService, TranslationObject } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';

export type Lang = 'en' | 'ml' | 'ta';
const STORAGE_KEY = 'ags.lang';

/** Languages offered, in menu order, with their names written in that language. */
export const LANGUAGES: { code: Lang; short: string; name: string }[] = [
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'ml', short: 'മല', name: 'മലയാളം' },
  { code: 'ta', short: 'தமி', name: 'தமிழ்' },
];

/** Bundles translations as JSON imports so they are available while prerendering. */
export class BundledTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    const load =
      lang === 'ml' ? import('../../i18n/ml.json') : lang === 'ta' ? import('../../i18n/ta.json') : import('../../i18n/en.json');
    return from(load.then((m) => m.default as TranslationObject));
  }
}

/** Pages are prerendered in English; the visitor's choice is restored in the browser. */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly current = signal<Lang>('en');

  async init(): Promise<void> {
    await this.use('en', false);
    if (this.isBrowser) {
      const saved = this.read();
      if (saved && saved !== 'en') await this.use(saved, false);
    }
  }

  async use(lang: Lang, remember = true): Promise<void> {
    await new Promise<void>((resolve) => this.translate.use(lang).subscribe({ complete: resolve, error: resolve }));
    this.current.set(lang);
    this.document.documentElement.lang = lang;
    if (this.isBrowser && remember) {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        /* storage blocked */
      }
    }
  }

  private read(): Lang | null {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return LANGUAGES.some((l) => l.code === v) ? (v as Lang) : null;
    } catch {
      return null;
    }
  }
}
