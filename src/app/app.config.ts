import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
  withViewTransitions,
} from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { routes } from './app.routes';
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
      withPreloading(PreloadAllModules),
    ),
    provideClientHydration(withEventReplay()),
    provideTranslateService({ loader: provideTranslateLoader(BundledTranslateLoader), fallbackLang: 'en' }),
    provideAppInitializer(() => inject(LanguageService).init()),
    // Starts loading GSAP/Lenis in the background; never blocks the first render.
    provideAppInitializer(() => inject(MotionService).init()),
  ],
};
