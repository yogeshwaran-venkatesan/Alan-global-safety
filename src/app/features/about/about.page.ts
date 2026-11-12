import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { COMPANY, OFFICES, PHOTOS } from '../../core/company.config';
import { pageSeo } from '../../core/page-seo';
import { organizationSchema } from '../../core/schema';
import { CountUpDirective, MagneticDirective, ParallaxDirective, RevealDirective, ScrubTextDirective, SplitRevealDirective } from '../../shared/motion';
import { Icon } from '../../shared/ui/icon';

@Component({
  selector: 'app-about-page',
  imports: [RouterLink, TranslatePipe, Icon, RevealDirective, SplitRevealDirective, ScrubTextDirective, CountUpDirective, MagneticDirective, ParallaxDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero -->
    <section class="relative isolate overflow-hidden pt-36 pb-20 sm:pt-48 sm:pb-28">
      <img [src]="photos.engineer" alt="" class="absolute inset-x-0 -top-[10%] -z-20 h-[120%] w-full object-cover opacity-40" [parallax]="16" />
      <div class="absolute inset-0 -z-10 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/40"></div>
      <div class="absolute inset-0 -z-10 bg-gradient-to-t from-ink-900 to-transparent"></div>
      <div class="container-x">
        <p class="eyebrow" reveal>{{ 'about.eyebrow' | translate }}</p>
        <h1 class="display mt-5 max-w-4xl text-[clamp(2.5rem,6.4vw,6rem)]" [splitReveal]="'about.title' | translate"></h1>
        <p class="mt-6 max-w-xl text-lg leading-relaxed text-steel-300" reveal>{{ 'about.lead' | translate: { years: company.experienceYears } }}</p>
      </div>
    </section>

    <!-- The name & the mark -->
    <section class="relative py-24 sm:py-32">
      <div class="container-x grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div class="relative mx-auto aspect-square w-full max-w-md" reveal="scale">
          <div class="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgba(179,201,43,0.25),transparent_65%)] blur-2xl" aria-hidden="true"></div>
          <svg viewBox="0 0 400 400" class="absolute inset-0 size-full" aria-hidden="true">
            <g class="origin-center animate-spin-slow" style="transform-box: fill-box">
              <circle cx="200" cy="200" r="190" fill="none" stroke="rgba(255,255,255,.22)" stroke-dasharray="2 9" />
              <path d="M200 10a190 190 0 0 1 164 95" fill="none" stroke="#b3c92b" stroke-width="2" stroke-linecap="round" />
            </g>
          </svg>
          <img [src]="photos.clientLogo" [alt]="'about.logoAlt' | translate" width="512" height="512" class="absolute inset-[8%] size-[84%] rounded-full object-cover shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]" />
        </div>
        <div>
          <p class="eyebrow" reveal>{{ 'about.name.eyebrow' | translate }}</p>
          <h2 class="display mt-5 text-[clamp(2rem,4.4vw,3.75rem)]" [splitReveal]="'about.name.title' | translate"></h2>
          <p class="mt-6 text-lg leading-relaxed text-steel-300" reveal>{{ 'about.name.p1' | translate }}</p>
          <p class="mt-4 leading-relaxed text-steel-400" reveal>{{ 'about.name.p2' | translate }}</p>
          <blockquote class="mt-8 border-l-2 border-hivis-500 pl-5 font-mono text-sm tracking-wider text-hivis-500 uppercase" reveal>{{ 'about.motto' | translate }}</blockquote>
        </div>
      </div>
    </section>

    <!-- Statement -->
    <section class="bg-ink-950 py-24 sm:py-32">
      <div class="container-x">
        <p class="display max-w-6xl text-[clamp(1.8rem,4.2vw,3.75rem)] !leading-[1.06] text-steel-100" [scrubText]="'about.statement' | translate: { years: company.experienceYears }"></p>
        <dl class="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-white/[0.08] lg:grid-cols-4" reveal>
          @for (s of stats; track s.key) {
            <div class="bg-ink-950 p-6 sm:p-8">
              <dt class="font-mono text-xs tracking-wider text-steel-400 uppercase">{{ 'about.stats.' + s.key | translate }}</dt>
              <dd class="display mt-3 text-4xl text-steel-100 sm:text-6xl"><span [countUp]="s.value"></span><span class="text-hivis-500">{{ s.suffix }}</span></dd>
            </div>
          }
        </dl>
      </div>
    </section>

    <!-- Scope of our venture -->
    <section class="relative py-24 sm:py-32">
      <div class="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div class="lg:sticky lg:top-32 lg:self-start">
          <p class="eyebrow" reveal>{{ 'about.scope.eyebrow' | translate }}</p>
          <h2 class="display mt-5 text-[clamp(2rem,4.4vw,3.75rem)]" [splitReveal]="'about.scope.title' | translate: { years: company.experienceYears }"></h2>
          <p class="mt-6 max-w-md leading-relaxed text-steel-300" reveal>{{ 'about.scope.lead' | translate }}</p>
        </div>
        <ol class="grid gap-px overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2" reveal revealStagger>
          @for (item of scopeItems(); track $index) {
            <li class="group flex gap-4 bg-ink-900 p-5 transition duration-500 hover:bg-ink-800 sm:p-6">
              <span class="font-mono text-xs text-hivis-500 tabular-nums">{{ ($index + 1).toString().padStart(2, '0') }}</span>
              <span class="text-[0.95rem] leading-relaxed text-steel-200">{{ item }}</span>
            </li>
          }
        </ol>
      </div>
    </section>

    <!-- Divisions -->
    <section class="bg-paper py-24 text-ink-900 sm:py-32">
      <div class="container-x">
        <p class="eyebrow !text-hivis-800" reveal>{{ 'about.divisions.eyebrow' | translate }}</p>
        <h2 class="display mt-5 max-w-3xl text-[clamp(2.2rem,5vw,4.5rem)] !text-ink-900" [splitReveal]="'about.divisions.title' | translate"></h2>
        <ul class="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" reveal revealStagger>
          @for (d of divisions; track d.key) {
            <li class="group relative overflow-hidden rounded-[1.5rem] bg-white p-7 shadow-[0_20px_50px_-30px_rgba(10,33,57,0.45)] transition duration-500 hover:-translate-y-1">
              <span class="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-hivis-500 transition-transform duration-500 group-hover:scale-x-100" aria-hidden="true"></span>
              <span class="grid size-12 place-items-center rounded-2xl bg-ink-900 text-hivis-500 transition duration-500 group-hover:bg-hivis-500 group-hover:text-ink-900"><app-icon [name]="d.icon" class="size-6" /></span>
              <h3 class="mt-6 text-lg font-bold !text-ink-900">{{ 'about.divisions.' + d.key + '.title' | translate }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-ink-900/75">{{ 'about.divisions.' + d.key + '.text' | translate }}</p>
            </li>
          }
        </ul>
        <p class="mt-14 max-w-3xl border-t border-ink-900/10 pt-10 text-lg leading-relaxed text-ink-900/75" reveal>{{ 'about.divisions.text' | translate }}</p>
      </div>
    </section>

    <!-- Message from the CEO -->
    <section class="relative overflow-hidden py-24 sm:py-32">
      <div class="absolute -right-40 bottom-0 -z-10 size-[40rem] rounded-full bg-[radial-gradient(circle,rgba(179,201,43,0.14),transparent_65%)] blur-2xl" aria-hidden="true"></div>
      <div class="container-x grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div class="relative mx-auto w-full max-w-md" reveal="scale">
          <div class="hazard absolute -top-4 -right-4 h-24 w-24 rounded-2xl opacity-80" aria-hidden="true"></div>
          <div class="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-hivis-300 to-hivis-500">
            <img [src]="photos.founder" [alt]="'about.ceo.alt' | translate: { name: company.ceo.name }" width="640" height="754" loading="lazy" class="w-full object-cover" />
          </div>
          <div class="glass absolute -bottom-6 -left-4 rounded-2xl border border-white/10 px-5 py-4 shadow-card sm:-left-8">
            <p class="font-mono text-[0.65rem] tracking-[0.2em] text-hivis-500 uppercase">{{ 'about.ceo.badge' | translate }}</p>
            <p class="display mt-1 text-2xl text-steel-100">{{ company.experienceYears }}+ <span class="text-base">{{ 'about.stats.years' | translate }}</span></p>
          </div>
        </div>
        <figure>
          <p class="eyebrow" reveal>{{ 'about.ceo.eyebrow' | translate }}</p>
          <app-icon name="quote" class="mt-6 size-10 text-hivis-500" reveal />
          <blockquote class="mt-4 grid gap-5 text-lg leading-relaxed text-steel-200" reveal>
            <p>{{ 'about.ceo.p1' | translate }}</p>
            <p>{{ 'about.ceo.p2' | translate }}</p>
            <p class="font-semibold text-steel-100">{{ 'about.ceo.p3' | translate }}</p>
          </blockquote>
          <figcaption class="mt-8 flex items-center gap-4" reveal>
            <span class="h-px w-12 bg-hivis-500"></span>
            <span><span class="block font-display text-xl font-bold text-steel-100">{{ company.ceo.name }}</span><span class="text-sm text-steel-400">{{ 'about.ceo.role' | translate }}</span></span>
          </figcaption>
          <div class="mt-10 flex flex-wrap gap-3" reveal>
            <a routerLink="/contact" magnetic class="btn btn-hivis">{{ 'about.ceo.cta' | translate }} <app-icon name="arrowUpRight" class="size-4" /></a>
            <a [href]="company.phones[0].href" magnetic class="btn btn-ghost"><app-icon name="phone" class="size-4" /> {{ company.phones[0].label }}</a>
          </div>
        </figure>
      </div>
    </section>
  `,
})
export class AboutPage {
  private readonly translate = inject(TranslateService);
  protected readonly company = COMPANY;
  protected readonly photos = PHOTOS;
  private readonly lang = toSignal(this.translate.onLangChange.pipe(map((e) => e.lang), startWith('en')));
  protected readonly scopeItems = computed<string[]>(() => {
    this.lang();
    const v = this.translate.instant('about.scope.items');
    return Array.isArray(v) ? v : [];
  });
  protected readonly stats = [
    { key: 'years', value: COMPANY.experienceYears, suffix: '+' },
    { key: 'inHouse', value: COMPANY.inHouseTrainings, suffix: '+' },
    { key: 'centralized', value: COMPANY.centralizedTrainings, suffix: '+' },
    { key: 'offices', value: OFFICES.length, suffix: '' },
  ];
  protected readonly divisions = [
    { key: 'ppe', icon: 'helmet' },
    { key: 'extinguishers', icon: 'flame' },
    { key: 'hydrant', icon: 'hydrant' },
    { key: 'training', icon: 'users' },
  ];

  constructor() {
    pageSeo('about', '/about', { image: PHOTOS.engineer, structuredData: (t) => [{ '@type': 'AboutPage', name: t('seo.about.title'), mainEntity: organizationSchema(t('seo.about.description')) }] });
  }
}
