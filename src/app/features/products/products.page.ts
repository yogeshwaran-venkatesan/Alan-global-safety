import { afterNextRender, ChangeDetectionStrategy, Component, computed, ElementRef, inject, Injector, signal, viewChildren } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { catalogItems, COMPANY, PRODUCT_CATEGORIES, PRODUCT_GROUPS, ProductGroupId } from '../../core/company.config';
import { itemName } from '../../core/catalog-text';
import { MotionService } from '../../core/motion';
import { pageSeo } from '../../core/page-seo';
import { MagneticDirective, RevealDirective, SplitRevealDirective } from '../../shared/motion';
import { CategoryCard } from '../../shared/ui/category-card';
import { Icon } from '../../shared/ui/icon';

type Filter = 'all' | ProductGroupId;

@Component({
  selector: 'app-products-page',
  imports: [RouterLink, TranslatePipe, Icon, CategoryCard, RevealDirective, SplitRevealDirective, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero -->
    <section class="relative overflow-hidden pt-36 pb-14 sm:pt-44">
      <div class="grid-lines absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true"></div>
      <div class="container-x grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <p class="eyebrow" reveal>{{ 'catalogue.eyebrow' | translate }}</p>
          <h1 class="display mt-5 text-[clamp(2.5rem,6vw,5.5rem)]" [splitReveal]="'catalogue.title' | translate"></h1>
        </div>
        <div reveal>
          <p class="max-w-md leading-relaxed text-steel-400">{{ 'catalogue.lead' | translate: { count: categories.length } }}</p>
          <a [href]="company.brochureUrl" target="_blank" rel="noopener" magnetic class="btn btn-ghost mt-6"><app-icon name="download" class="size-4" /> {{ 'common.brochure' | translate }}</a>
        </div>
      </div>
    </section>

    <!-- Filter bar (sticks under the header) -->
    <div class="sticky top-0 z-30 border-y border-white/[0.06] bg-ink-900/90 backdrop-blur-xl">
      <div class="container-x flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:gap-6">
        <label class="relative flex min-h-11 items-center lg:w-72 lg:shrink-0">
          <span class="sr-only">{{ 'catalogue.search' | translate }}</span>
          <app-icon name="search" class="pointer-events-none absolute left-4 size-4 text-steel-400" />
          <input type="search" [value]="query()" (input)="setQuery($any($event.target).value)" [placeholder]="'catalogue.searchPlaceholder' | translate"
                 class="h-11 w-full rounded-full border border-white/10 bg-white/[0.03] pr-11 pl-11 text-base text-steel-100 placeholder:text-steel-400 focus:border-hivis-500 focus:outline-none sm:text-sm" />
          @if (query()) {
            <button type="button" (click)="setQuery('')" class="absolute right-1.5 grid size-8 place-items-center rounded-full text-steel-400 hover:bg-white/5" [attr.aria-label]="'catalogue.clear' | translate">
              <app-icon name="close" class="size-4" />
            </button>
          }
        </label>
        <div class="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0" role="group" [attr.aria-label]="'catalogue.filter' | translate">
          @for (f of filters; track f) {
            <button type="button" (click)="setFilter(f)" [attr.aria-pressed]="filter() === f"
                    class="min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition duration-300"
                    [class]="filter() === f ? 'border-hivis-500 bg-hivis-500 text-ink-900' : 'border-white/10 text-steel-300 hover:border-white/30 hover:text-white'">
              {{ (f === 'all' ? 'catalogue.all' : 'products.groups.' + f) | translate }}
              <span class="ml-1 opacity-80">{{ countFor(f) }}</span>
            </button>
          }
        </div>
        <p class="hidden font-mono text-xs whitespace-nowrap text-steel-400 lg:ml-auto lg:block" aria-live="polite">
          {{ 'catalogue.showing' | translate: { count: visibleCount(), total: categories.length } }}
        </p>
      </div>
    </div>

    <!-- Results -->
    <section class="relative py-12 sm:py-16" aria-labelledby="catalogue-list">
      <div class="container-x">
        <h2 id="catalogue-list" class="sr-only">{{ 'catalogue.listTitle' | translate }}</h2>
        <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" reveal revealStagger>
          @for (c of categories; track c.slug; let i = $index) {
            <li #card [class.hidden]="!isVisible(c.slug)" [attr.data-flip-id]="c.slug">
              <app-category-card [category]="c" [index]="i" />
            </li>
          }
        </ul>
        @if (visibleCount() === 0) {
          <div class="grid place-items-center rounded-[2rem] border border-dashed border-white/15 px-6 py-20 text-center">
            <app-icon name="search" class="size-10 text-steel-400" />
            <p class="display mt-5 text-2xl">{{ 'catalogue.emptyTitle' | translate }}</p>
            <p class="mt-2 max-w-sm text-steel-400">{{ 'catalogue.emptyText' | translate }}</p>
            <div class="mt-7 flex flex-wrap justify-center gap-3">
              <button type="button" (click)="reset()" class="btn btn-ghost">{{ 'catalogue.reset' | translate }}</button>
              <a routerLink="/quote" class="btn btn-hivis">{{ 'nav.quote' | translate }}</a>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- Can't find it -->
    <section class="pb-24 sm:pb-32">
      <div class="container-x">
        <div class="relative grid gap-8 overflow-hidden rounded-[2rem] bg-hivis-500 p-8 text-ink-900 sm:p-12 lg:grid-cols-[1.5fr_1fr] lg:items-center" reveal="scale">
          <div class="hazard absolute -right-20 -bottom-6 h-12 w-80 -rotate-12 opacity-25" aria-hidden="true"></div>
          <div>
            <h2 class="display text-3xl !text-ink-900 sm:text-5xl">{{ 'home.products.allTitle' | translate }}</h2>
            <p class="mt-4 max-w-lg text-ink-900/75">{{ 'catalogue.sourceText' | translate }}</p>
          </div>
          <div class="flex flex-wrap gap-3 lg:justify-end">
            <a routerLink="/quote" magnetic class="btn btn-dark">{{ 'nav.quote' | translate }} <app-icon name="arrowUpRight" class="size-4" /></a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ProductsPage {
  protected readonly company = COMPANY;
  protected readonly categories = PRODUCT_CATEGORIES;
  protected readonly filters: Filter[] = ['all', ...PRODUCT_GROUPS.map((g) => g.id)];

  protected readonly filter = signal<Filter>('all');
  protected readonly query = signal('');

  private readonly translate = inject(TranslateService);
  private readonly motion = inject(MotionService);
  private readonly injector = inject(Injector);
  private readonly cards = viewChildren<ElementRef<HTMLElement>>('card');

  /** Re-index search text whenever the language changes. */
  private readonly lang = toSignal(this.translate.onLangChange.pipe(map((e) => e.lang)), { initialValue: 'en' });
  private readonly searchIndex = computed(() => {
    this.lang();
    return new Map(
      this.categories.map((c) => {
        const t = (k: string) => this.translate.instant(`products.categories.${c.slug}.${k}`);
        const items = catalogItems(c.slug).flatMap((i) => [i.label, itemName(this.translate, c.slug, i)]);
        return [c.slug, [t('name'), t('short'), ...items].join(' ').toLowerCase()];
      }),
    );
  });

  private readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.filter();
    const index = this.searchIndex();
    return new Set(
      this.categories.filter((c) => (f === 'all' || c.group === f) && (!q || q.split(/\s+/).every((w) => index.get(c.slug)!.includes(w)))).map((c) => c.slug),
    );
  });
  protected readonly visibleCount = computed(() => this.visible().size);

  constructor() {
    pageSeo('products', '/products');
  }

  protected isVisible(slug: string): boolean {
    return this.visible().has(slug);
  }

  protected countFor(f: Filter): number {
    return f === 'all' ? this.categories.length : this.categories.filter((c) => c.group === f).length;
  }

  protected setFilter(f: Filter): void {
    void this.animateChange(() => this.filter.set(f));
  }

  protected setQuery(q: string): void {
    void this.animateChange(() => this.query.set(q));
  }

  protected reset(): void {
    void this.animateChange(() => {
      this.query.set('');
      this.filter.set('all');
    });
  }

  /** Cards glide to their new places (GSAP Flip) instead of jumping. */
  private async animateChange(change: () => void): Promise<void> {
    const kit = this.motion.enabled ? await this.motion.ready() : null;
    if (!kit) {
      change();
      return;
    }
    const els = this.cards().map((c) => c.nativeElement);
    const state = kit.Flip.getState(els);
    change();
    afterNextRender(
      () => {
        kit.Flip.from(state, {
          duration: 0.7,
          ease: 'expo.out',
          scale: true,
          absolute: true,
          nested: true,
          onEnter: (e) => kit.gsap.fromTo(e, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6 }),
          onLeave: (e) => kit.gsap.to(e, { opacity: 0, scale: 0.9, duration: 0.35 }),
          onComplete: () => kit.ScrollTrigger.refresh(),
        });
      },
      { injector: this.injector },
    );
  }
}
