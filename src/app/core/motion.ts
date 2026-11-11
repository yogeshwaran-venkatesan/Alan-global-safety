import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { Router, Scroll } from '@angular/router';
import type { gsap as Gsap } from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';
import type { Flip as FlipType } from 'gsap/Flip';
import type { SplitText as SplitTextType } from 'gsap/SplitText';
import type Lenis from 'lenis';
import { filter } from 'rxjs';

export interface MotionKit {
  gsap: typeof Gsap;
  ScrollTrigger: typeof ScrollTriggerType;
  SplitText: typeof SplitTextType;
  Flip: typeof FlipType;
  lenis: Lenis | null;
}

/**
 * The motion engine: GSAP + ScrollTrigger + SplitText with Lenis smooth
 * scrolling, loaded lazily in the browser only (never during prerender), and
 * not at all when the visitor prefers reduced motion.
 *
 * Components and directives call `ready()` and get `null` when motion is off,
 * in which case content simply stays in its natural, visible state.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private kit: Promise<MotionKit | null> | null = null;
  /** True until the first page has finished its entrance — avoids hiding content already on screen. */
  private firstPaint = true;

  get enabled(): boolean {
    return this.browser && this.document.documentElement.classList.contains('motion');
  }

  /** Kick off loading early (app initializer) without blocking the first render. */
  init(): void {
    if (!this.enabled) return;
    void this.ready();
    setTimeout(() => (this.firstPaint = false), 1500);
  }

  /** Content that is already visible on the very first paint should not be hidden again. */
  isFirstPaint(): boolean {
    return this.firstPaint;
  }

  ready(): Promise<MotionKit | null> {
    if (!this.enabled) return Promise.resolve(null);
    this.kit ??= this.load();
    return this.kit;
  }

  scrollTo(target: number | string | HTMLElement): void {
    void this.ready().then((k) => (k?.lenis ? k.lenis.scrollTo(target as never, { offset: -90 }) : null));
  }

  private async load(): Promise<MotionKit | null> {
    try {
      const [{ gsap }, { ScrollTrigger }, { SplitText }, { Flip }, { default: LenisCtor }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('gsap/SplitText'),
        import('gsap/Flip'),
        import('lenis'),
      ]);
      gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
      gsap.defaults({ ease: 'expo.out', duration: 1.1 });

      // Smooth wheel scrolling on desktop; touch devices keep native momentum scrolling.
      const lenis = this.zone.runOutsideAngular(() => {
        const l = new LenisCtor({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
        l.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => l.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
        return l;
      });

      // New page: jump to the top instantly and re-measure every trigger once it has rendered.
      this.router.events.pipe(filter((e): e is Scroll => e instanceof Scroll)).subscribe((e) => {
        if (!e.anchor && !e.position) lenis.scrollTo(0, { immediate: true, force: true });
        requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
      });
      // Fonts change text metrics: re-measure once they're in.
      void this.document.fonts?.ready.then(() => ScrollTrigger.refresh());

      return { gsap, ScrollTrigger, SplitText, Flip, lenis };
    } catch (err) {
      console.warn('Motion disabled:', err);
      this.document.documentElement.classList.remove('motion');
      return null;
    }
  }
}
