import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Cursor } from './layout/cursor';
import { Footer } from './layout/footer';
import { Header } from './layout/header';
import { MobileBar } from './layout/mobile-bar';
import { RouteProgress } from './layout/route-progress';
import { Toasts } from './layout/toasts';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslatePipe, Header, Footer, MobileBar, Cursor, RouteProgress, Toasts],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-hivis-500 focus:px-5 focus:py-2.5 focus:font-semibold focus:text-ink-900">
      {{ 'nav.skip' | translate }}
    </a>
    <app-route-progress />
    <app-header />
    <main id="main"><router-outlet /></main>
    <app-footer />
    <app-mobile-bar />
    <app-toasts />
    <app-cursor />
    <div class="grain" aria-hidden="true"></div>
  `,
})
export class App {}
