import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { COMPANY, whatsappUrl } from '../core/company.config';
import { QuoteService } from '../core/quote';
import { Icon } from '../shared/ui/icon';

/** Thumb-reach actions on phones: Call · WhatsApp · Quote. */
@Component({
  selector: 'app-mobile-bar',
  imports: [RouterLink, TranslatePipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block sm:hidden' },
  template: `
    <nav class="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-ink-800/90 shadow-card backdrop-blur-xl"
         [attr.aria-label]="'quick.label' | translate">
      <a [href]="company.phones[0].href" class="flex flex-col items-center gap-1 py-2.5 text-xs font-semibold text-steel-200 active:bg-white/5">
        <app-icon name="phone" class="size-5" /> {{ 'quick.call' | translate }}
      </a>
      <a [href]="wa" target="_blank" rel="noopener" class="flex flex-col items-center gap-1 py-2.5 text-xs font-semibold text-[#5be38d] active:bg-white/5">
        <app-icon name="whatsapp" class="size-5" /> WhatsApp
      </a>
      <a routerLink="/quote" class="relative flex flex-col items-center gap-1 bg-hivis-500 py-2.5 text-xs font-bold text-ink-900">
        <app-icon name="clipboard" class="size-5" /> {{ 'nav.quote' | translate }}
        @if (quote.count()) { <span class="absolute top-1.5 right-[calc(50%-1.6rem)] grid min-w-5 place-items-center rounded-full bg-ink-900 px-1 font-mono text-[0.65rem] text-hivis-500">{{ quote.count() }}</span> }
      </a>
    </nav>
  `,
})
export class MobileBar {
  protected readonly company = COMPANY;
  protected readonly quote = inject(QuoteService);
  protected readonly wa = whatsappUrl('Hello Alan Global Safety, I would like to enquire about your products and trainings.');
}
