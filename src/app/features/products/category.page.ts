import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map, startWith } from 'rxjs';
import { catalogItems, categoryBySlug, PRODUCT_CATEGORIES, whatsappUrl } from '../../core/company.config';
import { itemName } from '../../core/catalog-text';
import { categoryLineId, itemLineId, QuoteService } from '../../core/quote';
import { absoluteUrl, SeoService } from '../../core/seo';
import { MotionService } from '../../core/motion';
import { ToastService } from '../../core/toast';
import { MagneticDirective, ParallaxDirective, RevealDirective, SplitRevealDirective } from '../../shared/motion';
import { CategoryCard } from '../../shared/ui/category-card';
import { Icon } from '../../shared/ui/icon';
import { NotFoundPage } from '../not-found/not-found.page';

@Component({
  selector: 'app-category-page',
  imports: [RouterLink, TranslatePipe, Icon, CategoryCard, NotFoundPage, RevealDirective, SplitRevealDirective, MagneticDirective, ParallaxDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (category(); as c) {
      <!-- Hero -->
      <section class="relative overflow-hidden pt-32 pb-20 sm:pt-40">
        <div class="grid-lines absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_70%_40%,black_20%,transparent_70%)]" aria-hidden="true"></div>
        <div class="container-x">
          <nav class="font-mono text-xs tracking-wider text-steel-400 uppercase" [attr.aria-label]="'category.breadcrumb' | translate" reveal="fade">
            <ol class="flex flex-wrap items-center gap-2">
              <li><a routerLink="/" class="hover:text-hivis-500">{{ 'nav.home' | translate }}</a></li>
              <li aria-hidden="true">/</li>
              <li><a routerLink="/products" class="hover:text-hivis-500">{{ 'nav.products' | translate }}</a></li>
              <li aria-hidden="true">/</li>
              <li class="text-steel-200" aria-current="page">{{ name() }}</li>
            </ol>
          </nav>

          <div class="mt-10 grid items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
            <div>
              <p class="eyebrow" reveal>{{ 'products.groups.' + c.group | translate }} · {{ pad(position()) }} / {{ pad(total) }}</p>
              <h1 class="display mt-5 text-[clamp(2.6rem,6.4vw,6rem)]" [splitReveal]="name()"></h1>
              <p class="mt-6 max-w-xl text-lg leading-relaxed text-steel-300" reveal>{{ 'products.categories.' + c.slug + '.short' | translate }}</p>
              <div class="mt-9 flex flex-wrap gap-3" reveal>
                <button type="button" (click)="toggleCategory()" magnetic class="btn" [class]="inQuote() ? 'btn-ghost' : 'btn-hivis'" [attr.aria-pressed]="inQuote()">
                  <app-icon [name]="inQuote() ? 'check' : 'plus'" class="size-4" [stroke]="2" />
                  {{ (inQuote() ? 'quote.inQuote' : 'category.addCategory') | translate }}
                </button>
                <a [href]="wa()" target="_blank" rel="noopener" magnetic class="btn btn-ghost"><app-icon name="whatsapp" class="size-4" /> {{ 'category.askWhatsapp' | translate }}</a>
              </div>
            </div>

            <!-- Icon "specimen" on a rotating stage -->
            <div class="relative mx-auto aspect-square w-full max-w-[26rem]" reveal="scale">
              <div class="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgba(179,201,43,0.28),rgba(47,143,214,0.08)_50%,transparent_70%)] blur-2xl"></div>
              <svg viewBox="0 0 400 400" class="absolute inset-0 size-full">
                <g class="origin-center animate-spin-slow" style="transform-box: fill-box">
                  <circle cx="200" cy="200" r="185" fill="none" stroke="rgba(255,255,255,.1)" stroke-dasharray="2 9" />
                  <path d="M200 15a185 185 0 0 1 160 92" fill="none" stroke="#b3c92b" stroke-width="2" stroke-linecap="round" />
                </g>
                <circle cx="200" cy="200" r="140" fill="rgba(255,255,255,.02)" stroke="rgba(255,255,255,.08)" />
                <path d="M200 8v16M200 376v16M8 200h16M376 200h16" stroke="rgba(255,255,255,.25)" stroke-width="1.5" />
              </svg>
              <!-- Product photo on a white "specimen plate" inside the rings -->
              <div class="absolute inset-[16%] grid place-items-center overflow-hidden rounded-full bg-paper shadow-[0_30px_80px_-20px_rgba(179,201,43,0.45)]" [parallax]="-10">
                <img [src]="c.image" [alt]="name()" width="480" height="480" class="size-[78%] object-contain mix-blend-multiply" />
              </div>
              <span class="absolute right-[12%] bottom-[14%] grid size-14 place-items-center rounded-2xl bg-hivis-500 text-ink-900 shadow-card"><app-icon [name]="c.icon" class="size-7" /></span>
            </div>
          </div>
        </div>
      </section>

      <!-- Products from the brochure -->
      <section class="border-t border-white/[0.06] bg-ink-950 py-20 sm:py-28">
        <div class="container-x">
          <div class="flex flex-wrap items-end justify-between gap-6">
            <div class="max-w-2xl">
              <p class="eyebrow" reveal>{{ 'category.supplyEyebrow' | translate }}</p>
              <h2 class="display mt-5 text-4xl sm:text-5xl" [splitReveal]="'category.supplyTitle' | translate: { count: products().length }"></h2>
              <p class="mt-5 leading-relaxed text-steel-400" reveal>{{ 'category.supplyText' | translate }}</p>
            </div>
            @if (products().length > 8) {
              <label class="relative block w-full sm:w-72" reveal>
                <span class="sr-only">{{ 'category.search' | translate }}</span>
                <app-icon name="search" class="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-steel-400" />
                <input type="search" [value]="query()" (input)="query.set($any($event.target).value)" [placeholder]="'category.search' | translate"
                       class="h-12 w-full rounded-full border border-white/10 bg-ink-800 pr-4 pl-11 text-base text-steel-100 placeholder:text-steel-400 focus:border-hivis-500 focus:outline-none sm:text-sm" />
              </label>
            }
          </div>

          <ul class="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4" reveal revealStagger>
            @for (p of products(); track p.item.id; let i = $index) {
              <li class="group flex min-w-0 flex-col overflow-hidden rounded-[1.25rem] border border-white/[0.07] bg-ink-800/60 transition duration-500 hover:-translate-y-1 hover:border-white/20"
                  [class.hidden]="!p.match">
                <div class="relative aspect-[4/3] overflow-hidden bg-paper">
                  <img [src]="p.item.img" [alt]="p.name" [width]="p.item.w" [height]="p.item.h" loading="lazy" decoding="async"
                       class="absolute inset-0 m-auto max-h-[78%] max-w-[84%] object-contain mix-blend-multiply transition duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.07]" />
                  <span class="absolute top-3 left-3 font-mono text-[0.65rem] text-ink-900/70">{{ pad(i + 1) }}</span>
                </div>
                <div class="flex flex-1 flex-col gap-3 p-3.5 sm:p-5">
                  <h3 class="flex-1 font-sans text-sm leading-snug font-semibold text-steel-100 sm:text-[0.95rem]">{{ p.name }}</h3>
                  <button type="button" (click)="toggleItem(p.item.id, p.name)" [attr.aria-pressed]="itemInQuote(p.item.id)"
                          [attr.aria-label]="(itemInQuote(p.item.id) ? 'quote.removeNamed' : 'quote.addNamed') | translate: { name: p.name }"
                          class="flex min-h-10 items-center justify-center gap-2 rounded-full border px-3 text-xs font-semibold transition duration-300 sm:text-sm"
                          [class]="itemInQuote(p.item.id) ? 'border-hivis-500 bg-hivis-500 text-ink-900' : 'border-white/15 text-steel-200 hover:border-hivis-500 hover:text-hivis-500'">
                    <app-icon [name]="itemInQuote(p.item.id) ? 'check' : 'plus'" class="size-4" [stroke]="2" />
                    {{ (itemInQuote(p.item.id) ? 'quote.added_short' : 'quote.add') | translate }}
                  </button>
                </div>
              </li>
            }
          </ul>
          @if (!anyMatch()) {
            <p class="mt-6 rounded-2xl border border-white/10 p-6 text-center text-steel-300" role="status">{{ 'category.noMatch' | translate }}</p>
          }
          <p class="mt-8 rounded-2xl border border-dashed border-white/15 p-5 text-sm leading-relaxed text-steel-400 sm:p-6" reveal>{{ 'category.indicative' | translate }}</p>
        </div>
      </section>

      <!-- Related -->
      <section class="py-20 sm:py-28">
        <div class="container-x">
          <div class="flex flex-wrap items-end justify-between gap-6">
            <h2 class="display text-3xl sm:text-4xl" reveal>{{ 'category.related' | translate: { group: ('products.groups.' + c.group | translate) } }}</h2>
            <a routerLink="/products" class="inline-flex min-h-11 items-center gap-2 font-semibold text-hivis-500 hover:text-hivis-300" reveal>{{ 'mega.all' | translate }} <app-icon name="arrow" class="size-4" /></a>
          </div>
          <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" reveal revealStagger>
            @for (r of related(); track r.slug) {
              <li><app-category-card [category]="r" [index]="indexOf(r.slug)" /></li>
            }
          </ul>
        </div>
      </section>

      <!-- Previous / next -->
      <nav class="grid border-t border-white/[0.06] sm:grid-cols-2" [attr.aria-label]="'category.pager' | translate">
        @for (p of pager(); track p.dir) {
          <a [routerLink]="['/products', p.cat.slug]"
             class="group relative isolate flex min-h-48 flex-col justify-center gap-3 overflow-hidden border-white/[0.06] px-6 py-10 transition-colors duration-500 hover:text-ink-900 sm:px-12"
             [class.sm:items-end]="p.dir === 'next'" [class.sm:text-right]="p.dir === 'next'" [class.sm:border-l]="p.dir === 'next'" [class.border-t]="p.dir === 'next'" [class.sm:border-t-0]="p.dir === 'next'">
            <span class="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-hivis-500 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100" aria-hidden="true"></span>
            <span class="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-steel-400 uppercase transition-colors group-hover:text-ink-900">
              @if (p.dir === 'prev') { <app-icon name="arrowLeft" class="size-4" /> }
              {{ 'category.' + p.dir | translate }}
              @if (p.dir === 'next') { <app-icon name="arrow" class="size-4" /> }
            </span>
            <span class="display text-2xl text-steel-100 transition-colors group-hover:text-ink-900 sm:text-4xl">{{ 'products.categories.' + p.cat.slug + '.name' | translate }}</span>
          </a>
        }
      </nav>
    } @else {
      <app-not-found-page />
    }
  `,
})
export class CategoryPage {
  /** From the route: /products/:slug */
  readonly slug = input.required<string>();

  private readonly translate = inject(TranslateService);
  private readonly quote = inject(QuoteService);
  private readonly toast = inject(ToastService);
  private readonly seo = inject(SeoService);
  private readonly motion = inject(MotionService);

  protected readonly total = PRODUCT_CATEGORIES.length;
  protected readonly category = computed(() => categoryBySlug(this.slug()));
  protected readonly position = computed(() => this.indexOf(this.slug()) + 1);

  private readonly lang = toSignal(this.translate.onLangChange.pipe(map((e) => e.lang), startWith(this.translate.getCurrentLang())));
  protected readonly name = computed(() => {
    this.lang();
    return this.translate.instant(`products.categories.${this.slug()}.name`) as string;
  });
  protected readonly query = signal('');
  /** Brochure products with names in the current language, flagged by the in-page search. */
  protected readonly products = computed(() => {
    this.lang();
    const q = this.query().trim().toLowerCase();
    return catalogItems(this.slug()).map((item) => {
      const name = itemName(this.translate, this.slug(), item);
      return { item, name, match: !q || name.toLowerCase().includes(q) || item.label.toLowerCase().includes(q) };
    });
  });
  protected readonly anyMatch = computed(() => this.products().some((p) => p.match));

  protected readonly inQuote = computed(() => this.quote.lines() && this.quote.has(categoryLineId(this.slug())));
  protected readonly related = computed(() => {
    const c = this.category();
    if (!c) return [];
    const same = PRODUCT_CATEGORIES.filter((x) => x.group === c.group && x.slug !== c.slug);
    const fill = PRODUCT_CATEGORIES.filter((x) => x.group !== c.group);
    return [...same, ...fill].slice(0, 3);
  });
  protected readonly pager = computed(() => {
    const i = this.indexOf(this.slug());
    const n = PRODUCT_CATEGORIES.length;
    return [
      { dir: 'prev' as const, cat: PRODUCT_CATEGORIES[(i - 1 + n) % n] },
      { dir: 'next' as const, cat: PRODUCT_CATEGORIES[(i + 1) % n] },
    ];
  });
  protected readonly wa = computed(() => whatsappUrl(this.translate.instant('category.waMessage', { name: this.name() })));

  constructor() {
    // Search shows cards that were hidden: let row-by-row reveals re-measure.
    effect(() => {
      this.query();
      void this.motion.ready().then((kit) => kit && requestAnimationFrame(() => kit.ScrollTrigger.refresh()));
    });
    // SEO is set once the route input is known (also during prerendering).
    effect(() => {
      const c = this.category();
      if (!c) {
        this.seo.set({ title: this.translate.instant('notFound.title'), description: this.translate.instant('notFound.text'), path: `/products/${this.slug()}`, noindex: true });
        return;
      }
      const t = (k: string) => this.translate.instant(k) as string;
      const name = t(`products.categories.${c.slug}.name`);
      const items = catalogItems(c.slug).map((i) => i.label);
      this.seo.set({
        title: t('seo.category.title').replace('{{name}}', name),
        description: `${t(`products.categories.${c.slug}.short`)} ${items.slice(0, 8).join(', ')}.`,
        path: `/products/${c.slug}`,
        structuredData: [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: t('nav.home'), item: absoluteUrl('/') },
              { '@type': 'ListItem', position: 2, name: t('nav.products'), item: absoluteUrl('/products') },
              { '@type': 'ListItem', position: 3, name, item: absoluteUrl(`/products/${c.slug}`) },
            ],
          },
        ],
      });
    });
  }

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  protected indexOf(slug: string): number {
    return PRODUCT_CATEGORIES.findIndex((c) => c.slug === slug);
  }

  protected itemInQuote(id: string): boolean {
    return this.quote.lines() && this.quote.has(itemLineId(this.slug(), id));
  }

  protected toggleCategory(): void {
    if (this.quote.toggle({ id: categoryLineId(this.slug()), kind: 'category', ref: this.slug() })) {
      this.toast.show({ message: 'quote.added', params: { name: this.name() }, link: { path: '/quote', label: 'quote.view' } });
    }
  }

  protected toggleItem(id: string, name: string): void {
    if (this.quote.toggle({ id: itemLineId(this.slug(), id), kind: 'item', ref: this.slug(), itemId: id })) {
      this.toast.show({ message: 'quote.added', params: { name }, link: { path: '/quote', label: 'quote.view' } });
    }
  }
}
