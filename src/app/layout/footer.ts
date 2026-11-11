import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { COMPANY, mapsDirectionsUrl, PRODUCT_CATEGORIES, whatsappUrl } from '../core/company.config';
import { MagneticDirective, RevealDirective, SplitRevealDirective } from '../shared/motion';
import { Icon } from '../shared/ui/icon';
import { Logo } from '../shared/ui/logo';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslatePipe, Icon, Logo, MagneticDirective, RevealDirective, SplitRevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'contentinfo', class: 'relative block overflow-hidden bg-ink-950 text-steel-400' },
  template: `
    <div class="hazard-animated h-2 w-full" aria-hidden="true"></div>

    <!-- Closing call to action -->
    <section class="container-x grid gap-10 border-b border-white/[0.06] py-20 sm:py-28 lg:grid-cols-[1.4fr_1fr] lg:items-end">
      <div>
        <p class="eyebrow">{{ 'footer.ctaEyebrow' | translate }}</p>
        <h2 class="display mt-5 text-[2.6rem] text-steel-100 sm:text-6xl lg:text-7xl" [splitReveal]="'footer.ctaTitle' | translate"></h2>
      </div>
      <div class="grid gap-3 sm:flex sm:flex-wrap lg:justify-end" reveal revealStagger>
        <a routerLink="/quote" magnetic class="btn btn-hivis">{{ 'nav.quote' | translate }} <app-icon name="arrowUpRight" class="size-4" /></a>
        <a [href]="wa" target="_blank" rel="noopener" magnetic class="btn btn-ghost"><app-icon name="whatsapp" class="size-4" /> WhatsApp</a>
      </div>
    </section>

    <div class="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
      <div>
        <app-logo />
        <p class="mt-6 max-w-xs text-sm leading-relaxed">{{ 'footer.about' | translate }}</p>
        <a [href]="company.brochureUrl" target="_blank" rel="noopener" class="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-hivis-500 hover:text-hivis-300">
          <app-icon name="download" class="size-4" /> {{ 'common.brochure' | translate }}
        </a>
      </div>

      <nav [attr.aria-label]="'footer.products' | translate">
        <h2 class="font-mono text-xs font-semibold tracking-[0.2em] text-steel-100 uppercase">{{ 'footer.products' | translate }}</h2>
        <ul class="mt-5 grid gap-1 text-sm">
          @for (c of topCategories; track c.slug) {
            <li><a [routerLink]="['/products', c.slug]" class="inline-block py-1.5 transition hover:text-hivis-500">{{ 'products.categories.' + c.slug + '.name' | translate }}</a></li>
          }
          <li><a routerLink="/products" class="inline-flex items-center gap-1 py-1.5 font-semibold text-steel-200 hover:text-hivis-500">{{ 'mega.all' | translate }} <app-icon name="arrow" class="size-3.5" /></a></li>
        </ul>
      </nav>

      <nav [attr.aria-label]="'footer.company' | translate">
        <h2 class="font-mono text-xs font-semibold tracking-[0.2em] text-steel-100 uppercase">{{ 'footer.company' | translate }}</h2>
        <ul class="mt-5 grid gap-1 text-sm">
          <li><a routerLink="/trainings" class="inline-block py-1.5 hover:text-hivis-500">{{ 'nav.trainings' | translate }}</a></li>
          <li><a routerLink="/about" class="inline-block py-1.5 hover:text-hivis-500">{{ 'nav.about' | translate }}</a></li>
          <li><a routerLink="/quote" class="inline-block py-1.5 hover:text-hivis-500">{{ 'nav.quote' | translate }}</a></li>
          <li><a routerLink="/contact" class="inline-block py-1.5 hover:text-hivis-500">{{ 'nav.contact' | translate }}</a></li>
        </ul>
      </nav>

      <div>
        <h2 class="font-mono text-xs font-semibold tracking-[0.2em] text-steel-100 uppercase">{{ 'footer.reach' | translate }}</h2>
        <address class="mt-5 grid gap-1 text-sm not-italic">
          <a [href]="directions" target="_blank" rel="noopener" class="flex gap-3 py-1.5 leading-relaxed hover:text-steel-100">
            <app-icon name="pin" class="mt-0.5 size-4 text-hivis-500" />
            <span>{{ company.address.line1 }}, {{ company.address.line2 }}, {{ company.address.area }}, {{ company.address.city }} – {{ company.address.pin }}</span>
          </a>
          @for (p of company.phones; track p.href) {
            <a [href]="p.href" class="flex items-center gap-3 py-1.5 hover:text-steel-100"><app-icon name="phone" class="size-4 text-hivis-500" /> {{ p.label }}</a>
          }
          <a [href]="'mailto:' + company.emails.info" class="flex items-center gap-3 py-1.5 break-all hover:text-steel-100"><app-icon name="mail" class="size-4 text-hivis-500" /> {{ company.emails.info }}</a>
          <a [href]="'mailto:' + company.emails.training" class="flex items-center gap-3 py-1.5 break-all hover:text-steel-100"><app-icon name="mail" class="size-4 text-hivis-500" /> {{ company.emails.training }}</a>
        </address>
      </div>
    </div>

    <!-- Oversized outlined wordmark -->
    <p class="display pointer-events-none -mb-[0.18em] text-center text-[13vw] leading-none whitespace-nowrap text-transparent select-none [-webkit-text-stroke:1px_rgb(255_255_255/0.08)]" aria-hidden="true">Alan Global</p>

    <div class="border-t border-white/[0.06]">
      <div class="container-x flex flex-col gap-2 pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-xs sm:flex-row sm:justify-between sm:pb-6">
        <p>© {{ year }} {{ company.name }}. {{ 'footer.rights' | translate }}</p>
        <p class="font-mono tracking-wider">{{ company.address.area }} · {{ company.address.city }}</p>
      </div>
    </div>
  `,
})
export class Footer {
  protected readonly company = COMPANY;
  protected readonly directions = mapsDirectionsUrl();
  protected readonly year = new Date().getFullYear();
  protected readonly topCategories = PRODUCT_CATEGORIES.filter((c) =>
    ['head-protection', 'respiratory-protection', 'fall-protection', 'gas-detection', 'safety-footwear', 'first-aid'].includes(c.slug),
  );
  protected readonly wa = whatsappUrl('Hello Alan Global Safety, I would like a quote for safety equipment.');
}
