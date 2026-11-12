import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, OnDestroy, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import type { gsap } from 'gsap';
import { map, startWith } from 'rxjs';
import { COMPANY, PHOTOS, whatsappUrl } from '../../core/company.config';
import { MotionService } from '../../core/motion';
import { QuoteService, trainingLineId } from '../../core/quote';
import { absoluteUrl, SeoService } from '../../core/seo';
import { ToastService } from '../../core/toast';
import { trainingByKey, TRAININGS } from '../../core/trainings.config';
import { MagneticDirective, RevealDirective, SplitRevealDirective } from '../../shared/motion';
import { Icon } from '../../shared/ui/icon';
import { TrainingCard } from '../../shared/ui/training-card';
import { NotFoundPage } from '../not-found/not-found.page';

@Component({
  selector: 'app-training-page',
  imports: [RouterLink, TranslatePipe, Icon, TrainingCard, NotFoundPage, RevealDirective, SplitRevealDirective, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (training(); as t) {
      <!-- Hero -->
      <section class="relative isolate overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div class="grid-lines absolute inset-0 -z-20 [mask-image:radial-gradient(ellipse_at_80%_30%,black_10%,transparent_70%)]" aria-hidden="true"></div>
        <!-- giant outlined programme code -->
        <span class="display pointer-events-none absolute top-24 right-[-2vw] -z-10 text-[34vw] leading-none text-transparent [-webkit-text-stroke:1px_rgb(179_201_43/0.18)] select-none lg:text-[22rem]" aria-hidden="true">{{ t.code.replace('ATP', '') }}</span>
        <div class="container-x">
          <nav class="font-mono text-xs tracking-wider text-steel-400 uppercase" [attr.aria-label]="'category.breadcrumb' | translate" reveal="fade">
            <ol class="flex flex-wrap items-center gap-2">
              <li><a routerLink="/" class="hover:text-hivis-500">{{ 'nav.home' | translate }}</a></li>
              <li aria-hidden="true">/</li>
              <li><a routerLink="/trainings" class="hover:text-hivis-500">{{ 'nav.trainings' | translate }}</a></li>
              <li aria-hidden="true">/</li>
              <li class="text-steel-200" aria-current="page">{{ t.code }}</li>
            </ol>
          </nav>
          <div class="mt-10 flex flex-wrap items-center gap-3" reveal>
            <span class="grid size-12 place-items-center rounded-2xl bg-hivis-500 text-ink-900"><app-icon [name]="t.icon" class="size-6" /></span>
            <span class="eyebrow">{{ 'trainings.detail.programme' | translate }} {{ t.code }} · {{ 'trainings.themes.' + t.theme | translate }}</span>
          </div>
          <h1 class="display mt-6 max-w-5xl text-[clamp(2.4rem,5.6vw,5.25rem)]" [splitReveal]="title()"></h1>
          <p class="mt-6 max-w-2xl text-lg leading-relaxed text-steel-300" reveal>{{ 'trainings.programmes.' + t.key + '.short' | translate }}</p>
          <div class="mt-9 flex flex-wrap gap-3" reveal>
            <button type="button" (click)="toggle()" magnetic class="btn" [class]="booked() ? 'btn-ghost' : 'btn-hivis'" [attr.aria-pressed]="booked()">
              <app-icon [name]="booked() ? 'check' : 'plus'" class="size-4" [stroke]="2" /> {{ (booked() ? 'trainings.inBooking' : 'trainings.book') | translate }}
            </button>
            <a [href]="wa()" target="_blank" rel="noopener" magnetic class="btn btn-ghost"><app-icon name="whatsapp" class="size-4" /> {{ 'trainings.askWhatsapp' | translate }}</a>
          </div>
        </div>
      </section>

      <!-- Topics: a line fills down the list as you read -->
      <section class="border-t border-white/[0.06] bg-ink-950 py-20 sm:py-28">
        <div class="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div class="lg:sticky lg:top-28 lg:self-start">
            <p class="eyebrow" reveal>{{ 'trainings.detail.learnEyebrow' | translate }}</p>
            <h2 class="display mt-5 text-4xl sm:text-5xl" [splitReveal]="'trainings.detail.learnTitle' | translate"></h2>
            <p class="mt-5 font-mono text-sm text-steel-400" reveal>{{ 'trainings.topics' | translate: { count: objectives().length } }}</p>
            <div class="relative mt-10 overflow-hidden rounded-[1.5rem] border border-white/[0.08]" reveal="scale">
              <img [src]="photo()" alt="" loading="lazy" class="aspect-[4/3] w-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent"></div>
            </div>
          </div>
          <ol class="relative pl-10" #topics>
            <span class="absolute top-2 bottom-2 left-[0.9rem] w-px bg-white/10" aria-hidden="true"></span>
            <span #topicsLine class="absolute top-2 bottom-2 left-[0.9rem] w-px origin-top bg-hivis-500" aria-hidden="true"></span>
            @for (o of objectives(); track $index; let i = $index) {
              <li class="relative py-5" reveal="left">
                <span class="absolute top-6 -left-10 grid size-[1.9rem] place-items-center rounded-full border border-hivis-500/60 bg-ink-950 font-mono text-[0.7rem] text-hivis-500">{{ i + 1 }}</span>
                <p class="text-lg font-semibold text-steel-100 sm:text-xl">{{ o }}</p>
              </li>
            }
          </ol>
        </div>
      </section>

      <!-- Book -->
      <section class="py-20 sm:py-24">
        <div class="container-x">
          <div class="relative grid gap-8 overflow-hidden rounded-[2rem] bg-hivis-500 p-8 text-ink-900 sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center" reveal="scale">
            <div class="hazard absolute -right-24 -bottom-6 h-12 w-96 -rotate-12 opacity-20" aria-hidden="true"></div>
            <div>
              <h2 class="display text-3xl !text-ink-900 sm:text-5xl">{{ 'trainings.detail.bookTitle' | translate }}</h2>
              <p class="mt-4 max-w-lg text-ink-900/75">{{ 'trainings.detail.bookText' | translate }}</p>
            </div>
            <div class="flex flex-wrap gap-3 lg:justify-end">
              <button type="button" (click)="toggle()" magnetic class="btn btn-dark" [attr.aria-pressed]="booked()">
                <app-icon [name]="booked() ? 'check' : 'plus'" class="size-4" [stroke]="2" /> {{ (booked() ? 'trainings.inBooking' : 'trainings.book') | translate }}
              </button>
              <a routerLink="/quote" class="btn border border-ink-900/25">{{ 'quote.view' | translate }} <app-icon name="arrow" class="size-4" /></a>
            </div>
          </div>
        </div>
      </section>

      <!-- Related -->
      <section class="pb-20 sm:pb-28">
        <div class="container-x">
          <div class="flex flex-wrap items-end justify-between gap-6">
            <h2 class="display text-3xl sm:text-4xl" reveal>{{ 'trainings.detail.related' | translate: { theme: ('trainings.themes.' + t.theme | translate) } }}</h2>
            <a routerLink="/trainings" class="inline-flex min-h-11 items-center gap-2 font-semibold text-hivis-500 hover:text-hivis-300" reveal>{{ 'home.trainings.cta' | translate: { count: total } }} <app-icon name="arrow" class="size-4" /></a>
          </div>
          <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" reveal revealStagger>
            @for (r of related(); track r.key) { <li><app-training-card [training]="r" /></li> }
          </ul>
        </div>
      </section>

      <!-- Previous / next -->
      <nav class="grid border-t border-white/[0.06] sm:grid-cols-2" [attr.aria-label]="'trainings.detail.pager' | translate">
        @for (p of pager(); track p.dir) {
          <a [routerLink]="['/trainings', p.t.key]"
             class="group relative isolate flex min-h-44 flex-col justify-center gap-3 overflow-hidden border-white/[0.06] px-6 py-10 transition-colors duration-500 hover:text-ink-900 sm:px-12"
             [class.sm:items-end]="p.dir === 'next'" [class.sm:text-right]="p.dir === 'next'" [class.sm:border-l]="p.dir === 'next'" [class.border-t]="p.dir === 'next'" [class.sm:border-t-0]="p.dir === 'next'">
            <span class="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-hivis-500 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100" aria-hidden="true"></span>
            <span class="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-steel-400 uppercase transition-colors group-hover:text-ink-900">
              @if (p.dir === 'prev') { <app-icon name="arrowLeft" class="size-4" /> }
              {{ 'category.' + p.dir | translate }} · {{ p.t.code }}
              @if (p.dir === 'next') { <app-icon name="arrow" class="size-4" /> }
            </span>
            <span class="text-xl font-bold text-steel-100 transition-colors group-hover:text-ink-900 sm:text-2xl">{{ 'trainings.programmes.' + p.t.key + '.title' | translate }}</span>
          </a>
        }
      </nav>
    } @else {
      <app-not-found-page />
    }
  `,
})
export class TrainingPage implements OnDestroy {
  /** From the route: /trainings/:key */
  readonly key = input.required<string>();

  private readonly translate = inject(TranslateService);
  private readonly quote = inject(QuoteService);
  private readonly toast = inject(ToastService);
  private readonly seo = inject(SeoService);
  private readonly motion = inject(MotionService);
  private readonly topicsEl = viewChild<ElementRef<HTMLElement>>('topics');
  private readonly topicsLine = viewChild<ElementRef<HTMLElement>>('topicsLine');
  private ctx?: gsap.Context;

  protected readonly total = TRAININGS.length;
  protected readonly training = computed(() => trainingByKey(this.key()));
  private readonly lang = toSignal(this.translate.onLangChange.pipe(map((e) => e.lang), startWith('en')));
  protected readonly title = computed(() => {
    this.lang();
    return this.translate.instant(`trainings.programmes.${this.key()}.title`) as string;
  });
  protected readonly objectives = computed<string[]>(() => {
    this.lang();
    const o = this.translate.instant(`trainings.programmes.${this.key()}.objectives`);
    return Array.isArray(o) ? o : [];
  });
  protected readonly booked = computed(() => this.quote.lines() && this.quote.has(trainingLineId(this.key())));
  protected readonly photo = computed(() => {
    const t = this.training();
    if (t?.photo) return t.photo;
    const theme = t?.theme;
    return theme === 'fire' || theme === 'emergency' ? PHOTOS.firefighter : theme === 'highRisk' ? PHOTOS.workerMask : PHOTOS.engineer;
  });
  protected readonly related = computed(() => {
    const t = this.training();
    if (!t) return [];
    return [...TRAININGS.filter((x) => x.theme === t.theme && x.key !== t.key), ...TRAININGS.filter((x) => x.theme !== t.theme)].slice(0, 3);
  });
  protected readonly pager = computed(() => {
    const i = TRAININGS.findIndex((t) => t.key === this.key());
    const n = TRAININGS.length;
    return [
      { dir: 'prev' as const, t: TRAININGS[(i - 1 + n) % n] },
      { dir: 'next' as const, t: TRAININGS[(i + 1) % n] },
    ];
  });
  protected readonly wa = computed(() =>
    whatsappUrl(this.translate.instant('trainings.waMessage', { code: this.training()?.code ?? '', name: this.title() })),
  );
  protected readonly company = COMPANY;

  constructor() {
    effect(() => {
      const t = this.training();
      const tr = (k: string, p?: object) => this.translate.instant(k, p) as string;
      if (!t) {
        this.seo.set({ title: tr('notFound.title'), description: tr('notFound.text'), path: `/trainings/${this.key()}`, noindex: true });
        return;
      }
      const name = tr(`trainings.programmes.${t.key}.title`);
      const objectives = this.translate.instant(`trainings.programmes.${t.key}.objectives`) as string[];
      const path = `/trainings/${t.key}`;
      this.seo.set({
        title: tr('seo.training.title', { code: t.code, name }),
        description: `${tr(`trainings.programmes.${t.key}.short`)} ${objectives.slice(0, 4).join(', ')}.`,
        path,
        image: PHOTOS.firefighter,
        structuredData: [
          {
            '@type': 'Course',
            name: `${t.code} ${name}`,
            description: tr(`trainings.programmes.${t.key}.short`),
            courseCode: t.code,
            url: absoluteUrl(path),
            teaches: objectives,
            provider: { '@type': 'Organization', name: COMPANY.name, url: absoluteUrl('/') },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: tr('nav.home'), item: absoluteUrl('/') },
              { '@type': 'ListItem', position: 2, name: tr('nav.trainings'), item: absoluteUrl('/trainings') },
              { '@type': 'ListItem', position: 3, name: `${t.code} ${name}`, item: absoluteUrl(path) },
            ],
          },
        ],
      });
    });
    afterNextRender(() => void this.drawLine());
  }

  /** The hi-vis line grows down the topic list as it scrolls through the viewport. */
  private async drawLine(): Promise<void> {
    const kit = await this.motion.ready();
    const list = this.topicsEl()?.nativeElement;
    const line = this.topicsLine()?.nativeElement;
    if (!kit || !list || !line) return;
    this.ctx = kit.gsap.context(() => {
      kit.gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 } });
    });
  }

  protected toggle(): void {
    const t = this.training();
    if (!t) return;
    if (this.quote.toggle({ id: trainingLineId(t.key), kind: 'training', ref: t.key })) {
      this.toast.show({ message: 'quote.added', params: { name: t.code }, link: { path: '/quote', label: 'quote.view' } });
    }
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
