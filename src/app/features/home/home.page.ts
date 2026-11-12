import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import type { gsap } from 'gsap';
import { COMPANY, FEATURED_TRAININGS, PHOTOS, PRODUCT_CATEGORIES, TRAINING_COUNT } from '../../core/company.config';
import { MotionService } from '../../core/motion';
import { pageSeo } from '../../core/page-seo';
import { absoluteUrl } from '../../core/seo';
import { officesSchema, organizationSchema } from '../../core/schema';
import {
  CountUpDirective,
  MagneticDirective,
  ParallaxDirective,
  RevealDirective,
  ScrubTextDirective,
  SplitRevealDirective,
} from '../../shared/motion';
import { HeroArt } from '../../shared/ui/hero-art';
import { Icon } from '../../shared/ui/icon';
import { Logo } from '../../shared/ui/logo';

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    TranslatePipe,
    Icon,
    Logo,
    HeroArt,
    RevealDirective,
    SplitRevealDirective,
    ScrubTextDirective,
    CountUpDirective,
    MagneticDirective,
    ParallaxDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.page.html',
})
export class HomePage implements OnDestroy {
  protected readonly company = COMPANY;
  protected readonly photos = PHOTOS;
  protected readonly categories = PRODUCT_CATEGORIES;
  protected readonly trainings = FEATURED_TRAININGS;
  protected readonly trainingCount = TRAINING_COUNT;

  protected readonly stats = [
    { key: 'years', value: COMPANY.experienceYears, suffix: '+' },
    { key: 'categories', value: PRODUCT_CATEGORIES.length, suffix: '' },
    { key: 'programmes', value: TRAINING_COUNT, suffix: '' },
  ];

  protected readonly divisions = [
    { key: 'equipment', no: '01', icon: 'helmet', photo: PHOTOS.ppeFlatlay, link: '/products', tags: ['products.groups.ppe', 'products.groups.height', 'products.groups.detection'] },
    { key: 'training', no: '02', icon: 'flame', photo: PHOTOS.firefighter, link: '/trainings', tags: ['home.divisions.training.tag1', 'home.divisions.training.tag2', 'home.divisions.training.tag3'] },
  ];

  /** CONFIRM with client: describes how enquiries are handled. */
  protected readonly steps = [
    { key: 'enquire', icon: 'clipboard' },
    { key: 'recommend', icon: 'shield' },
    { key: 'deliver', icon: 'truck' },
    { key: 'train', icon: 'users' },
  ];


  private readonly translate = inject(TranslateService);
  private readonly motion = inject(MotionService);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  private readonly tape = viewChild.required<ElementRef<HTMLElement>>('tape');
  private readonly process = viewChild.required<ElementRef<HTMLElement>>('process');
  private readonly processLine = viewChild.required<ElementRef<SVGLineElement>>('processLine');

  private ctx?: gsap.Context;
  private cleanups: (() => void)[] = [];
  private destroyed = false;

  constructor() {
    pageSeo('home', '/', { structuredData: (t) => [organizationSchema(t('seo.home.description')), ...officesSchema(), { '@type': 'WebSite', name: COMPANY.name, url: absoluteUrl('/'), inLanguage: ['en', 'ml', 'ta'] }] });
    afterNextRender(() => void this.animate());
  }

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }


  /** Subtle 3D tilt for the division cards (fine pointers only). */
  protected tilt(e: PointerEvent): void {
    if (e.pointerType !== 'mouse' || !this.motion.enabled) return;
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1100px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  }

  protected untilt(e: PointerEvent): void {
    const el = e.currentTarget as HTMLElement;
    el.style.transition = 'transform .8s cubic-bezier(.16,1,.3,1), box-shadow .5s, border-color .5s';
    el.style.transform = '';
    setTimeout(() => (el.style.transition = ''), 800);
  }

  private async animate(): Promise<void> {
    const kit = await this.motion.ready();
    if (!kit || this.destroyed) return;
    const { gsap, ScrollTrigger } = kit;
    const hero = this.hero().nativeElement;

    this.ctx = gsap.context(() => {
      // ---- Hero intro: copy rises in, the hat drops onto its stage.
      const intro = hero.querySelectorAll<HTMLElement>('[data-intro]:not(h1)');
      gsap
        .timeline({ defaults: { ease: 'expo.out' }, onComplete: () => document.documentElement.classList.add('intro-done') })
        .fromTo(intro, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 1.3, stagger: 0.09 }, 0.1)
        .fromTo(hero.querySelector('[data-hero-art]'), { autoAlpha: 0, scale: 0.86, rotate: -6 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.8 }, 0.2);

      // ---- Hero scroll-out: copy lifts and fades, the art drifts and shrinks.
      gsap.to(hero.querySelector('[data-hero-copy]'), {
        yPercent: -18,
        autoAlpha: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to(hero.querySelector('[data-hero-art]'), {
        yPercent: 22,
        scale: 0.86,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });

      // ---- Caution tape leans with scroll speed.
      const tape = this.tape().nativeElement;
      const skew = gsap.quickTo(tape, 'skewX', { duration: 0.6, ease: 'power3.out' });
      ScrollTrigger.create({
        trigger: tape,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => skew(gsap.utils.clamp(-8, 8, self.getVelocity() / -260)),
      });

      // ---- Process line draws itself.
      gsap.fromTo(
        this.processLine().nativeElement,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: this.process().nativeElement, start: 'top 75%', end: 'bottom 60%', scrub: 0.8 } },
      );
    }, this.host);

    // ---- Pointer parallax on the hero art layers.
    if (matchMedia('(pointer: fine)').matches) {
      const layers = Array.from(hero.querySelectorAll<HTMLElement>('[data-depth]')).map((el) => ({
        x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' }),
        depth: Number(el.dataset['depth'] ?? 0.5),
      }));
      const move = (e: PointerEvent) => {
        const nx = e.clientX / innerWidth - 0.5;
        const ny = e.clientY / innerHeight - 0.5;
        for (const l of layers) {
          l.x(nx * 40 * l.depth);
          l.y(ny * 40 * l.depth);
        }
      };
      hero.addEventListener('pointermove', move, { passive: true });
      this.cleanups.push(() => hero.removeEventListener('pointermove', move));
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.cleanups.forEach((fn) => fn());
    this.ctx?.revert();
  }
}
