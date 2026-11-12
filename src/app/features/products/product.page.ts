import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map, startWith } from 'rxjs';
import { catalogItem, catalogItems, categoryBySlug, whatsappUrl } from '../../core/company.config';
import { itemName } from '../../core/catalog-text';
import { itemLineId, QuoteService } from '../../core/quote';
import { absoluteUrl, SeoService } from '../../core/seo';
import { ToastService } from '../../core/toast';
import { MagneticDirective, ParallaxDirective, RevealDirective, SplitRevealDirective } from '../../shared/motion';
import { Icon } from '../../shared/ui/icon';
import { NotFoundPage } from '../not-found/not-found.page';

interface Datasheet {
  intro: string;
  specs: { label: string; value: string }[];
  features: string[];
  setup: string[];
  applications: string[];
  limitations: string[];
}

/** One product with a full datasheet: /products/<section>/<item>. */
@Component({
  selector: 'app-product-page',
  imports: [RouterLink, TranslatePipe, Icon, NotFoundPage, RevealDirective, SplitRevealDirective, MagneticDirective, ParallaxDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (product(); as p) {
      <!-- Hero -->
      <section class="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div class="grid-lines absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_70%_40%,black_20%,transparent_70%)]" aria-hidden="true"></div>
        <div class="container-x">
          <nav class="font-mono text-xs tracking-wider text-steel-400 uppercase" [attr.aria-label]="'category.breadcrumb' | translate" reveal="fade">
            <ol class="flex flex-wrap items-center gap-2">
              <li><a routerLink="/" class="hover:text-hivis-500">{{ 'nav.home' | translate }}</a></li>
              <li aria-hidden="true">/</li>
              <li><a routerLink="/products" class="hover:text-hivis-500">{{ 'nav.products' | translate }}</a></li>
              <li aria-hidden="true">/</li>
              <li><a [routerLink]="['/products', p.section]" class="hover:text-hivis-500">{{ sectionName() }}</a></li>
              <li aria-hidden="true">/</li>
              <li class="text-steel-200" aria-current="page">{{ name() }}</li>
            </ol>
          </nav>

          <div class="mt-10 grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
            <div class="min-w-0">
              <p class="eyebrow" reveal>{{ sectionName() }}</p>
              <h1 class="display mt-5 text-[clamp(2.2rem,5.4vw,4.75rem)]" [splitReveal]="name()"></h1>
              <p class="mt-6 max-w-xl text-lg leading-relaxed text-steel-300" reveal>{{ sheet().intro }}</p>
              <div class="mt-9 flex flex-wrap gap-3" reveal>
                <button type="button" (click)="toggle()" magnetic class="btn" [class]="inQuote() ? 'btn-ghost' : 'btn-hivis'" [attr.aria-pressed]="inQuote()">
                  <app-icon [name]="inQuote() ? 'check' : 'plus'" class="size-4" [stroke]="2" />
                  {{ (inQuote() ? 'quote.inQuote' : 'category.addCategory') | translate }}
                </button>
                <a [href]="wa()" target="_blank" rel="noopener" magnetic class="btn btn-ghost"><app-icon name="whatsapp" class="size-4" /> {{ 'product.askWhatsapp' | translate }}</a>
              </div>
            </div>

            <div class="relative mx-auto w-full max-w-lg" reveal="scale">
              <div class="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(179,201,43,0.28),rgba(47,143,214,0.08)_50%,transparent_70%)] blur-2xl" aria-hidden="true"></div>
              <div class="relative grid aspect-square place-items-center overflow-hidden rounded-[2rem] border border-white/10 bg-paper shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)]" [parallax]="-8">
                @if (p.item.img) {
                  <img [src]="p.item.img" [alt]="name()" [width]="p.item.w" [height]="p.item.h" fetchpriority="high"
                       [class]="p.item.photo ? 'absolute inset-0 size-full object-cover' : 'absolute inset-0 m-auto max-h-[86%] max-w-[86%] object-contain mix-blend-multiply'" />
                } @else {
                  <div class="grid place-items-center gap-4 text-ink-900/70">
                    <span class="grid size-20 place-items-center rounded-3xl bg-ink-900 text-hivis-500"><app-icon [name]="icon()" class="size-10" /></span>
                    <span class="font-mono text-xs tracking-[0.2em] uppercase">{{ 'product.photoSoon' | translate }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Datasheet -->
      <section class="border-t border-white/[0.06] bg-ink-950 py-20 sm:py-28">
        <div class="container-x grid gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div class="min-w-0">
            @if (sheet().specs.length) {
              <p class="eyebrow" reveal>{{ 'product.datasheet' | translate }}</p>
              <h2 class="display mt-5 text-3xl sm:text-4xl" [splitReveal]="'product.specs' | translate"></h2>
              <dl class="mt-10 overflow-hidden rounded-[1.5rem] border border-white/[0.08]" reveal>
                @for (s of sheet().specs; track $index; let odd = $odd) {
                  <div class="grid gap-1 px-5 py-4 sm:grid-cols-[minmax(10rem,0.8fr)_1.2fr] sm:gap-6 sm:px-6" [class.bg-white/[0.03]]="odd">
                    <dt class="text-sm font-semibold text-hivis-500">{{ s.label }}</dt>
                    <dd class="text-[0.95rem] leading-relaxed text-steel-200">{{ s.value }}</dd>
                  </div>
                }
              </dl>
            }
            @if (sheet().setup.length) {
              <h2 class="display mt-16 text-3xl sm:text-4xl first:mt-0" [splitReveal]="'product.setup' | translate"></h2>
              <ol class="mt-8 grid gap-3" reveal revealStagger>
                @for (s of sheet().setup; track $index; let i = $index) {
                  <li class="flex gap-4 rounded-2xl border border-white/[0.07] bg-ink-800/60 p-5">
                    <span class="grid size-8 shrink-0 place-items-center rounded-full border border-hivis-500/60 font-mono text-xs text-hivis-500">{{ i + 1 }}</span>
                    <p class="leading-relaxed text-steel-200">{{ s }}</p>
                  </li>
                }
              </ol>
            }
          </div>

          <aside class="grid content-start gap-6 lg:sticky lg:top-28 lg:self-start">
            @if (sheet().features.length) {
              <div class="rounded-[1.5rem] bg-paper p-6 text-ink-900 sm:p-8" reveal>
                <h2 class="display text-2xl !text-ink-900">{{ 'product.features' | translate }}</h2>
                <ul class="mt-5 grid gap-3">
                  @for (f of sheet().features; track $index) {
                    <li class="flex gap-3 text-[0.95rem] leading-relaxed text-ink-900/80">
                      <span class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-hivis-500 text-ink-900"><app-icon name="check" class="size-3" [stroke]="3" /></span>{{ f }}
                    </li>
                  }
                </ul>
              </div>
            }
            @if (sheet().applications.length) {
              <div class="rounded-[1.5rem] border border-white/[0.08] bg-ink-800/60 p-6 sm:p-8" reveal>
                <h2 class="display text-2xl">{{ 'product.applications' | translate }}</h2>
                <ul class="mt-5 flex flex-wrap gap-2">
                  @for (a of sheet().applications; track $index) {
                    <li class="rounded-full border border-white/15 px-3.5 py-1.5 text-sm text-steel-200">{{ a }}</li>
                  }
                </ul>
              </div>
            }
            @if (sheet().limitations.length) {
              <div class="rounded-[1.5rem] border border-signal-500/40 bg-signal-500/[0.06] p-6 sm:p-8" reveal>
                <h2 class="display text-2xl">{{ 'product.limitations' | translate }}</h2>
                <ul class="mt-5 grid gap-2 text-[0.95rem] text-steel-200">
                  @for (l of sheet().limitations; track $index) { <li class="flex gap-3"><app-icon name="alert" class="mt-0.5 size-4 shrink-0 text-signal-400" />{{ l }}</li> }
                </ul>
              </div>
            }
          </aside>
        </div>
      </section>

      <!-- More in this section -->
      @if (related().length) {
        <section class="py-20 sm:py-28">
          <div class="container-x">
            <div class="flex flex-wrap items-end justify-between gap-6">
              <h2 class="display text-3xl sm:text-4xl" reveal>{{ 'product.related' | translate: { section: sectionName() } }}</h2>
              <a [routerLink]="['/products', p.section]" class="inline-flex min-h-11 items-center gap-2 font-semibold text-hivis-500 hover:text-hivis-300" reveal>{{ 'product.all' | translate: { section: sectionName() } }} <app-icon name="arrow" class="size-4" /></a>
            </div>
            <ul class="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" reveal revealStagger>
              @for (r of related(); track r.item.id) {
                <li class="group relative flex min-w-0 flex-col overflow-hidden rounded-[1.25rem] border border-white/[0.07] bg-ink-800/60 transition duration-500 hover:-translate-y-1 hover:border-white/20">
                  <div class="relative grid aspect-[4/3] place-items-center overflow-hidden bg-paper">
                    @if (r.item.img) {
                      <img [src]="r.item.img" [alt]="r.name" [width]="r.item.w" [height]="r.item.h" loading="lazy" [class]="r.item.photo ? 'absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.07]' : 'absolute inset-0 m-auto max-h-[78%] max-w-[84%] object-contain mix-blend-multiply transition duration-700 group-hover:scale-[1.07]'" />
                    } @else {
                      <span class="grid size-12 place-items-center rounded-2xl bg-ink-900 text-hivis-500"><app-icon [name]="icon()" class="size-6" /></span>
                    }
                  </div>
                  <h3 class="p-4 font-sans text-sm leading-snug font-semibold text-steel-100 sm:text-[0.95rem]">
                    <a [routerLink]="['/products', p.section, r.item.id]" class="after:absolute after:inset-0 after:content-['']">{{ r.name }}</a>
                  </h3>
                </li>
              }
            </ul>
          </div>
        </section>
      }
    } @else {
      <app-not-found-page />
    }
  `,
})
export class ProductPage {
  /** From the route: /products/:slug/:item */
  readonly slug = input.required<string>();
  readonly item = input.required<string>();

  private readonly translate = inject(TranslateService);
  private readonly quote = inject(QuoteService);
  private readonly toast = inject(ToastService);
  private readonly seo = inject(SeoService);

  private readonly lang = toSignal(this.translate.onLangChange.pipe(map((e) => e.lang), startWith(this.translate.getCurrentLang())));

  protected readonly product = computed(() => {
    const item = catalogItem(this.slug(), this.item());
    return item?.detail && categoryBySlug(this.slug()) ? { section: this.slug(), item } : undefined;
  });
  protected readonly icon = computed(() => categoryBySlug(this.slug())?.icon ?? 'shield');
  protected readonly name = computed(() => {
    this.lang();
    const p = this.product();
    return p ? itemName(this.translate, p.section, p.item) : '';
  });
  protected readonly sectionName = computed(() => {
    this.lang();
    return this.translate.instant(`products.categories.${this.slug()}.name`) as string;
  });
  protected readonly sheet = computed<Datasheet>(() => {
    this.lang();
    const base = `products.details.${this.slug()}.${this.item()}`;
    const list = (k: string): string[] => {
      const v = this.translate.instant(`${base}.${k}`);
      return Array.isArray(v) ? v : [];
    };
    const labels = list('specLabels');
    const values = list('specValues');
    return {
      intro: this.translate.instant(`${base}.intro`) as string,
      specs: labels.map((label, i) => ({ label, value: values[i] ?? '' })),
      features: list('features'),
      setup: list('setup'),
      applications: list('applications'),
      limitations: list('limitations'),
    };
  });
  protected readonly related = computed(() => {
    this.lang();
    const p = this.product();
    if (!p) return [];
    return catalogItems(p.section)
      .filter((i) => i.detail && i.id !== p.item.id)
      .slice(0, 4)
      .map((item) => ({ item, name: itemName(this.translate, p.section, item) }));
  });
  protected readonly inQuote = computed(() => this.quote.lines() && this.quote.has(itemLineId(this.slug(), this.item())));
  protected readonly wa = computed(() => whatsappUrl(this.translate.instant('product.waMessage', { name: this.name() })));

  constructor() {
    effect(() => {
      const p = this.product();
      const path = `/products/${this.slug()}/${this.item()}`;
      if (!p) {
        this.seo.set({ title: this.translate.instant('notFound.title'), description: this.translate.instant('notFound.text'), path, noindex: true });
        return;
      }
      const name = this.name();
      const section = this.sectionName();
      const intro = this.sheet().intro;
      this.seo.set({
        title: (this.translate.instant('seo.product.title', { name, section }) as string),
        description: intro,
        path,
        image: p.item.img,
        structuredData: [
          {
            '@type': 'Product',
            name,
            description: intro,
            category: section,
            ...(p.item.img ? { image: absoluteUrl(p.item.img) } : {}),
            url: absoluteUrl(path),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: this.translate.instant('nav.home'), item: absoluteUrl('/') },
              { '@type': 'ListItem', position: 2, name: this.translate.instant('nav.products'), item: absoluteUrl('/products') },
              { '@type': 'ListItem', position: 3, name: section, item: absoluteUrl(`/products/${p.section}`) },
              { '@type': 'ListItem', position: 4, name, item: absoluteUrl(path) },
            ],
          },
        ],
      });
    });
  }

  protected toggle(): void {
    const p = this.product();
    if (!p) return;
    if (this.quote.toggle({ id: itemLineId(p.section, p.item.id), kind: 'item', ref: p.section, itemId: p.item.id })) {
      this.toast.show({ message: 'quote.added', params: { name: this.name() }, link: { path: '/quote', label: 'quote.view' } });
    }
  }
}
