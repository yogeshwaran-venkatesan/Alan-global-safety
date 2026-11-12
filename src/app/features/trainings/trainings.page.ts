import { afterNextRender, ChangeDetectionStrategy, Component, computed, ElementRef, inject, Injector, signal, viewChildren } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { COMPANY, PHOTOS } from '../../core/company.config';
import { MotionService } from '../../core/motion';
import { pageSeo } from '../../core/page-seo';
import { TRAINING_PHOTOS, TRAINING_THEMES, TrainingTheme, TRAININGS } from '../../core/trainings.config';
import { MagneticDirective, ParallaxDirective, RevealDirective, SplitRevealDirective } from '../../shared/motion';
import { Icon } from '../../shared/ui/icon';
import { TrainingCard } from '../../shared/ui/training-card';

type Filter = 'all' | TrainingTheme;

@Component({
  selector: 'app-trainings-page',
  imports: [RouterLink, TranslatePipe, Icon, TrainingCard, RevealDirective, SplitRevealDirective, MagneticDirective, ParallaxDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero over a real photo from the client's site -->
    <section class="relative isolate overflow-hidden pt-36 pb-20 sm:pt-48 sm:pb-28">
      <img [src]="photos.firefighter" alt="" class="absolute inset-x-0 -top-[10%] -z-20 h-[120%] w-full object-cover opacity-50" [parallax]="18" />
      <div class="absolute inset-0 -z-10 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/30"></div>
      <div class="absolute inset-0 -z-10 bg-gradient-to-t from-ink-900 to-transparent"></div>
      <div class="container-x">
        <p class="eyebrow" reveal>{{ 'trainings.eyebrow' | translate }}</p>
        <h1 class="display mt-5 max-w-4xl text-[clamp(2.5rem,6.2vw,5.75rem)]" [splitReveal]="'trainings.title' | translate"></h1>
        <p class="mt-6 max-w-xl text-lg leading-relaxed text-steel-300" reveal>{{ 'trainings.lead' | translate }}</p>
        <div class="mt-9 flex flex-wrap gap-3" reveal>
          <a routerLink="/quote" magnetic class="btn btn-hivis">{{ 'nav.quote' | translate }} <app-icon name="arrowUpRight" class="size-4" /></a>
          <a [href]="'mailto:' + company.emails.training" magnetic class="btn btn-ghost"><app-icon name="mail" class="size-4" /> {{ 'trainings.email' | translate }}</a>
        </div>
      </div>
    </section>

    <!-- Filter bar -->
    <div class="sticky top-0 z-30 border-y border-white/[0.06] bg-ink-900/90 backdrop-blur-xl">
      <div class="container-x flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:gap-6">
        <label class="relative flex min-h-11 items-center lg:w-72 lg:shrink-0">
          <span class="sr-only">{{ 'trainings.search' | translate }}</span>
          <app-icon name="search" class="pointer-events-none absolute left-4 size-4 text-steel-400" />
          <input type="search" [value]="query()" (input)="setQuery($any($event.target).value)" [placeholder]="'trainings.searchPlaceholder' | translate"
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
              {{ 'trainings.themes.' + f | translate }} <span class="ml-1 opacity-80">{{ countFor(f) }}</span>
            </button>
          }
        </div>
        <p class="hidden font-mono text-xs whitespace-nowrap text-steel-400 lg:ml-auto lg:block" aria-live="polite">
          {{ 'catalogue.showing' | translate: { count: visibleCount(), total: trainings.length } }}
        </p>
      </div>
    </div>

    <section class="py-12 sm:py-16" aria-labelledby="programme-list">
      <div class="container-x">
        <h2 id="programme-list" class="sr-only">{{ 'trainings.listTitle' | translate }}</h2>
        <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" reveal revealStagger>
          @for (t of trainings; track t.key) {
            <li #card [class.hidden]="!isVisible(t.key)"><app-training-card [training]="t" /></li>
          }
        </ul>
        @if (visibleCount() === 0) {
          <div class="grid place-items-center rounded-[2rem] border border-dashed border-white/15 px-6 py-20 text-center">
            <app-icon name="search" class="size-10 text-steel-400" />
            <p class="display mt-5 text-2xl">{{ 'trainings.emptyTitle' | translate }}</p>
            <p class="mt-2 max-w-sm text-steel-400">{{ 'trainings.emptyText' | translate }}</p>
            <button type="button" (click)="reset()" class="btn btn-ghost mt-7">{{ 'catalogue.reset' | translate }}</button>
          </div>
        }
      </div>
    </section>

    <!-- Photo strip from the brochure's in-house training page -->
    <section class="marquee relative overflow-hidden border-y border-white/[0.06] bg-ink-950 py-14 sm:py-20" [attr.aria-label]="'trainings.photos' | translate">
      <div class="container-x mb-8 flex flex-wrap items-end justify-between gap-4">
        <p class="eyebrow" reveal>{{ 'trainings.photos' | translate }}</p>
        <p class="max-w-md text-sm text-steel-400" reveal>{{ 'trainings.photosText' | translate }}</p>
      </div>
      <div class="marquee-track flex w-max animate-[marquee_60s_linear_infinite] motion-reduce:animate-none">
        @for (half of [0, 1]; track half) {
          <ul class="flex shrink-0 gap-4 pr-4" [attr.aria-hidden]="half === 1">
            @for (src of stripPhotos; track src) {
              <li class="h-44 w-64 shrink-0 overflow-hidden rounded-[1.25rem] sm:h-56 sm:w-80">
                <img [src]="src" alt="" loading="lazy" decoding="async" class="size-full object-cover transition duration-700 hover:scale-105" />
              </li>
            }
          </ul>
        }
      </div>
    </section>

    <!-- How sessions run (CONFIRM wording with the client) -->
    <section class="relative overflow-hidden bg-paper py-24 text-ink-900 sm:py-32">
      <div class="container-x">
        <p class="eyebrow !text-hivis-800" reveal>{{ 'trainings.how.eyebrow' | translate }}</p>
        <h2 class="display mt-5 text-[clamp(2.2rem,5vw,4.5rem)] !text-ink-900" [splitReveal]="'trainings.how.title' | translate"></h2>
        <ol class="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" reveal revealStagger>
          @for (s of steps; track s.key; let i = $index) {
            <li class="relative overflow-hidden rounded-[1.5rem] bg-white p-7 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)]">
              <span class="display absolute -top-3 right-3 text-7xl text-ink-900/[0.06] before:content-[attr(data-n)]" [attr.data-n]="'0' + (i + 1)" aria-hidden="true"></span>
              <span class="grid size-12 place-items-center rounded-2xl bg-ink-900 text-hivis-500"><app-icon [name]="s.icon" class="size-6" /></span>
              <h3 class="mt-6 text-lg font-bold !text-ink-900">{{ 'trainings.how.' + s.key + '.title' | translate }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-ink-900/75">{{ 'trainings.how.' + s.key + '.text' | translate }}</p>
            </li>
          }
        </ol>
      </div>
    </section>
  `,
})
export class TrainingsPage {
  protected readonly company = COMPANY;
  protected readonly photos = PHOTOS;
  protected readonly stripPhotos = TRAINING_PHOTOS;
  protected readonly trainings = TRAININGS;
  protected readonly filters: Filter[] = ['all', ...TRAINING_THEMES.map((t) => t.id)];
  protected readonly steps = [
    { key: 'plan', icon: 'clipboard' },
    { key: 'learn', icon: 'users' },
    { key: 'practise', icon: 'flame' },
    { key: 'review', icon: 'check' },
  ];

  protected readonly filter = signal<Filter>('all');
  protected readonly query = signal('');

  private readonly translate = inject(TranslateService);
  private readonly motion = inject(MotionService);
  private readonly injector = inject(Injector);
  private readonly cards = viewChildren<ElementRef<HTMLElement>>('card');
  private readonly lang = toSignal(this.translate.onLangChange.pipe(map((e) => e.lang)), { initialValue: 'en' });

  private readonly index = computed(() => {
    this.lang();
    return new Map(
      this.trainings.map((t) => {
        const p = (k: string) => this.translate.instant(`trainings.programmes.${t.key}.${k}`);
        const o = p('objectives');
        return [t.key, [t.code, p('title'), p('short'), Array.isArray(o) ? o.join(' ') : ''].join(' ').toLowerCase()];
      }),
    );
  });
  private readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.filter();
    const idx = this.index();
    return new Set(
      this.trainings.filter((t) => (f === 'all' || t.theme === f) && (!q || q.split(/\s+/).every((w) => idx.get(t.key)!.includes(w)))).map((t) => t.key),
    );
  });
  protected readonly visibleCount = computed(() => this.visible().size);

  constructor() {
    pageSeo('trainings', '/trainings', { image: PHOTOS.firefighter });
  }

  protected isVisible(key: string): boolean {
    return this.visible().has(key);
  }

  protected countFor(f: Filter): number {
    return f === 'all' ? this.trainings.length : this.trainings.filter((t) => t.theme === f).length;
  }

  protected setFilter(f: Filter): void {
    void this.animate(() => this.filter.set(f));
  }

  protected setQuery(q: string): void {
    void this.animate(() => this.query.set(q));
  }

  protected reset(): void {
    void this.animate(() => {
      this.query.set('');
      this.filter.set('all');
    });
  }

  /** Cards glide into their new places (GSAP Flip). */
  private async animate(change: () => void): Promise<void> {
    const kit = this.motion.enabled ? await this.motion.ready() : null;
    if (!kit) return change();
    const state = kit.Flip.getState(this.cards().map((c) => c.nativeElement));
    change();
    afterNextRender(
      () =>
        kit.Flip.from(state, {
          duration: 0.7,
          ease: 'expo.out',
          scale: true,
          absolute: true,
          onEnter: (e) => kit.gsap.fromTo(e, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6 }),
          onLeave: (e) => kit.gsap.to(e, { opacity: 0, scale: 0.9, duration: 0.35 }),
          onComplete: () => kit.ScrollTrigger.refresh(),
        }),
      { injector: this.injector },
    );
  }
}
