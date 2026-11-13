import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
  withViewTransitions,
} from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { routes } from './app.routes';
import { IdlePreload } from './core/idle-preload';
import { BundledTranslateLoader, LanguageService } from './core/i18n';
import { MotionService } from './core/motion';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({ skipInitialTransition: true }),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      withPreloading(IdlePreload),
    ),
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    provideTranslateService({ loader: provideTranslateLoader(BundledTranslateLoader), fallbackLang: 'en' }),
    provideAppInitializer(() => inject(LanguageService).init()),
    // Starts loading GSAP/Lenis in the background; never blocks the first render.
    provideAppInitializer(() => inject(MotionService).init()),
  ],
};
