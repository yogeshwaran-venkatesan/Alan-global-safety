import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map, startWith } from 'rxjs';
import { CatalogItem, catalogItem, catalogItems, FAST_MOVING } from '../../core/company.config';
import { itemName } from '../../core/catalog-text';
import { itemLineId, QuoteService } from '../../core/quote';
import { ToastService } from '../../core/toast';
import { RevealDirective, SplitRevealDirective } from '../motion';
import { Icon } from './icon';

interface Card {
  section: string;
  item: CatalogItem;
  name: string;
}

/** Fast-moving products, one card each, in tabs by category. Used on Home and Products. */
@Component({
  selector: 'app-fast-moving',
  imports: [RouterLink, TranslatePipe, Icon, RevealDirective, SplitRevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex flex-wrap items-end justify-between gap-6">
      <div class="max-w-2xl">
        <p class="eyebrow" reveal>{{ 'fast.eyebrow' | translate }}</p>
        @if (headingLevel() === 1) {
          <h1 class="display mt-5 text-[clamp(2.2rem,5vw,4.5rem)]" [splitReveal]="'fast.title' | translate"></h1>
        } @else {
          <h2 class="display mt-5 text-[clamp(2.2rem,5vw,4.5rem)]" [splitReveal]="'fast.title' | translate"></h2>
        }
        <p class="mt-5 leading-relaxed text-steel-400" reveal>{{ 'fast.lead' | translate }}</p>
      </div>
    </div>

    <!-- Tabs: wrap on wide screens, swipe on phones -->
    <div class="-mx-5 mt-10 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden" reveal>
      <div class="flex w-max gap-2 md:w-auto md:flex-wrap" role="tablist" [attr.aria-label]="'fast.title' | translate">
        @for (t of tabs; track t.key) {
          <button type="button" role="tab" [attr.aria-selected]="active() === t.key" [attr.aria-controls]="'fast-panel'" (click)="select(t.key)"
                  class="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition duration-300"
                  [class]="active() === t.key ? 'border-hivis-500 bg-hivis-500 text-ink-900' : 'border-white/12 text-steel-200 hover:border-white/30 hover:text-white'">
            <app-icon [name]="t.icon" class="size-4" /> {{ tabLabel(t.key) }}
            <span class="font-mono text-xs opacity-70">{{ count(t.key) }}</span>
          </button>
        }
      </div>
    </div>

    <div id="fast-panel" role="tabpanel" class="mt-8">
      <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        @for (c of shown(); track c.section + c.item.id) {
          <li class="fast-card group relative flex min-w-0 flex-col overflow-hidden rounded-[1.25rem] border border-white/[0.07] bg-ink-800/70 transition duration-500 hover:-translate-y-1 hover:border-white/20">
            <a [routerLink]="link(c)" class="relative block aspect-[4/3] overflow-hidden bg-paper" [attr.aria-label]="c.name">
              @if (c.item.img) {
                <img [src]="c.item.img" alt="" [width]="c.item.w" [height]="c.item.h" loading="lazy" decoding="async"
                     [class]="c.item.photo ? 'absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.07]' : 'absolute inset-0 m-auto max-h-[78%] max-w-[84%] object-contain mix-blend-multiply transition duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.07]'" />
              }
            </a>
            <div class="flex flex-1 flex-col gap-3 p-3.5 sm:p-4">
              <h3 class="flex-1 font-sans text-sm leading-snug font-semibold text-steel-100">
                <a [routerLink]="link(c)" class="transition hover:text-hivis-500">{{ c.name }}</a>
              </h3>
              <button type="button" (click)="toggle(c)" [attr.aria-pressed]="inQuote(c)"
                      [attr.aria-label]="(inQuote(c) ? 'quote.removeNamed' : 'quote.addNamed') | translate: { name: c.name }"
                      class="flex min-h-10 items-center justify-center gap-2 rounded-full border px-3 text-xs font-semibold transition duration-300 sm:text-sm"
                      [class]="inQuote(c) ? 'border-hivis-500 bg-hivis-500 text-ink-900' : 'border-white/15 text-steel-200 hover:border-hivis-500 hover:text-hivis-500'">
                <app-icon [name]="inQuote(c) ? 'check' : 'plus'" class="size-4" [stroke]="2" />
                {{ (inQuote(c) ? 'quote.added_short' : 'quote.add') | translate }}
              </button>
            </div>
          </li>
        }
      </ul>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        @if (cards().length > limit && !expanded()) {
          <button type="button" (click)="expanded.set(true)" class="btn btn-ghost">{{ 'fast.showAll' | translate: { count: cards().length } }}</button>
        }
        @if (activeTab().category; as cat) {
          <a [routerLink]="['/products', cat]" class="btn btn-hivis">{{ 'fast.openCategory' | translate: { name: tabLabel(activeTab().key) } }} <app-icon name="arrow" class="size-4" /></a>
        }
      </div>
    </div>
  `,
})
export class FastMoving {
  /** 1 when the section is the page's main heading. */
  readonly headingLevel = input<1 | 2>(2);

  private readonly translate = inject(TranslateService);
  private readonly quote = inject(QuoteService);
  private readonly toast = inject(ToastService);
  private readonly lang = toSignal(this.translate.onLangChange.pipe(map((e) => e.lang), startWith(this.translate.getCurrentLang())));

  protected readonly tabs = FAST_MOVING;
  protected readonly limit = 10;
  protected readonly active = signal(FAST_MOVING[0].key);
  protected readonly expanded = signal(false);
  protected readonly activeTab = computed(() => FAST_MOVING.find((t) => t.key === this.active()) ?? FAST_MOVING[0]);

  protected readonly cards = computed<Card[]>(() => {
    this.lang();
    return this.cardsFor(this.activeTab().key);
  });
  protected readonly shown = computed(() => (this.expanded() ? this.cards() : this.cards().slice(0, this.limit)));

  protected select(key: string): void {
    this.active.set(key);
    this.expanded.set(false);
  }

  protected tabLabel(key: string): string {
    this.lang();
    const t = FAST_MOVING.find((x) => x.key === key)!;
    return this.translate.instant(t.category ? `products.categories.${t.category}.name` : `products.groups.${t.key}`) as string;
  }

  protected count(key: string): number {
    return this.cardsFor(key).length;
  }

  protected link(c: Card): string[] {
    return c.item.detail ? ['/products', c.section, c.item.id] : ['/products', c.section];
  }

  protected inQuote(c: Card): boolean {
    return this.quote.lines() && this.quote.has(itemLineId(c.section, c.item.id));
  }

  protected toggle(c: Card): void {
    if (this.quote.toggle({ id: itemLineId(c.section, c.item.id), kind: 'item', ref: c.section, itemId: c.item.id })) {
      this.toast.show({ message: 'quote.added', params: { name: c.name }, link: { path: '/quote', label: 'quote.view' } });
    }
  }

  private cardsFor(key: string): Card[] {
    const t = FAST_MOVING.find((x) => x.key === key);
    if (!t) return [];
    const pairs: [string, CatalogItem | undefined][] = t.category
      ? catalogItems(t.category).map((i) => [t.category!, i])
      : (t.picks ?? []).map(([s, id]) => [s, catalogItem(s, id)]);
    return pairs.filter((p): p is [string, CatalogItem] => !!p[1]).map(([section, item]) => ({ section, item, name: itemName(this.translate, section, item) }));
  }
}
