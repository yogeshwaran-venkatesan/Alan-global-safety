import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { pageSeo } from '../../core/page-seo';
import { MagneticDirective } from '../../shared/motion';
import { Icon } from '../../shared/ui/icon';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, TranslatePipe, Icon, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid-lines relative grid min-h-[90svh] place-items-center overflow-hidden px-5 pt-24 text-center">
      <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 -rotate-6" aria-hidden="true"><div class="hazard-animated h-14 opacity-[0.07]"></div></div>
      <div class="relative">
        <p class="display text-[9rem] leading-none text-transparent [-webkit-text-stroke:2px_var(--color-hivis-500)] sm:text-[14rem]">404</p>
        <h1 class="display mt-2 text-3xl sm:text-5xl">{{ 'notFound.title' | translate }}</h1>
        <p class="mx-auto mt-4 max-w-md text-steel-400">{{ 'notFound.text' | translate }}</p>
        <a routerLink="/" magnetic class="btn btn-hivis mt-10">{{ 'notFound.home' | translate }} <app-icon name="arrow" class="size-4" /></a>
      </div>
    </section>
  `,
})
export class NotFoundPage {
  constructor() {
    pageSeo('notFound', '/404', { noindex: true });
  }
}
