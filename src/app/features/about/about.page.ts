import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { COMPANY, PHOTOS, PRODUCT_CATEGORIES, TRAINING_COUNT } from '../../core/company.config';
import { pageSeo } from '../../core/page-seo';
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
          <div class="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgba(255,194,26,0.25),transparent_65%)] blur-2xl" aria-hidden="true"></div>
          <svg viewBox="0 0 400 400" class="absolute inset-0 size-full" aria-hidden="true">
            <g class="origin-center animate-spin-slow" style="transform-box: fill-box">
              <circle cx="200" cy="200" r="190" fill="none" stroke="rgba(255,255,255,.22)" stroke-dasharray="2 9" />
              <path d="M200 10a190 190 0 0 1 164 95" fill="none" stroke="#ffc21a" stroke-width="2" stroke-linecap="round" />
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

    <!-- Leadership (CONFIRM name and role with the client) -->
    <section class="relative py-24 sm:py-32">
      <div class="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div class="relative order-2 lg:order-1" reveal>
          <p class="eyebrow">{{ 'about.leader.eyebrow' | translate }}</p>
          <h2 class="display mt-5 text-[clamp(2rem,4.4vw,3.75rem)]" [splitReveal]="'about.leader.title' | translate"></h2>
          <p class="mt-6 max-w-lg text-lg leading-relaxed text-steel-300">{{ 'about.leader.text' | translate: { years: company.experienceYears } }}</p>
          <div class="mt-9 flex flex-wrap gap-3">
            <a routerLink="/contact" magnetic class="btn btn-hivis">{{ 'about.leader.cta' | translate }} <app-icon name="arrowUpRight" class="size-4" /></a>
            <a [href]="company.phones[0].href" magnetic class="btn btn-ghost"><app-icon name="phone" class="size-4" /> {{ company.phones[0].label }}</a>
          </div>
        </div>
        <div class="relative order-1 mx-auto w-full max-w-md lg:order-2" reveal="scale">
          <div class="hazard absolute -top-4 -right-4 h-24 w-24 rounded-2xl opacity-80" aria-hidden="true"></div>
          <div class="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-steel-100 to-steel-300">
            <img [src]="photos.founder" [alt]="'about.leader.alt' | translate" width="640" height="754" loading="lazy" class="w-full object-cover" />
          </div>
          <div class="glass absolute -bottom-6 -left-4 rounded-2xl border border-white/10 px-5 py-4 shadow-card sm:-left-8">
            <p class="font-mono text-[0.65rem] tracking-[0.2em] text-hivis-500 uppercase">{{ 'about.leader.badge' | translate }}</p>
            <p class="display mt-1 text-2xl text-steel-100">{{ company.experienceYears }}+ <span class="text-base">{{ 'about.stats.years' | translate }}</span></p>
          </div>
        </div>
      </div>
    </section>

    <!-- Values (CONFIRM) -->
    <section class="bg-paper py-24 text-ink-900 sm:py-32">
      <div class="container-x">
        <p class="eyebrow !text-hivis-800" reveal>{{ 'about.values.eyebrow' | translate }}</p>
        <h2 class="display mt-5 max-w-3xl text-[clamp(2.2rem,5vw,4.5rem)] !text-ink-900" [splitReveal]="'about.values.title' | translate"></h2>
        <ul class="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" reveal revealStagger>
          @for (v of values; track v.key) {
            <li class="group rounded-[1.5rem] bg-white p-7 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)] transition duration-500 hover:-translate-y-1">
              <span class="grid size-12 place-items-center rounded-2xl bg-ink-900 text-hivis-500 transition duration-500 group-hover:bg-hivis-500 group-hover:text-ink-900"><app-icon [name]="v.icon" class="size-6" /></span>
              <h3 class="mt-6 text-lg font-bold !text-ink-900">{{ 'about.values.' + v.key + '.title' | translate }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-ink-900/65">{{ 'about.values.' + v.key + '.text' | translate }}</p>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class AboutPage {
  protected readonly company = COMPANY;
  protected readonly photos = PHOTOS;
  protected readonly stats = [
    { key: 'years', value: COMPANY.experienceYears, suffix: '+' },
    { key: 'categories', value: PRODUCT_CATEGORIES.length, suffix: '' },
    { key: 'programmes', value: TRAINING_COUNT, suffix: '' },
    { key: 'divisions', value: 2, suffix: '' },
  ];
  protected readonly values = [
    { key: 'right', icon: 'shield' },
    { key: 'trained', icon: 'users' },
    { key: 'honest', icon: 'check' },
    { key: 'fast', icon: 'truck' },
  ];

  constructor() {
    pageSeo('about', '/about', { image: PHOTOS.engineer });
  }
}
