import { afterNextRender, booleanAttribute, Directive, ElementRef, inject, input, OnDestroy } from '@angular/core';
import type { gsap } from 'gsap';
import { MotionService } from '../../core/motion';
import { onceInView } from './in-view';

export type RevealVariant = 'up' | 'fade' | 'scale' | 'left' | 'right' | 'clip';

const FROM: Record<RevealVariant, gsap.TweenVars> = {
  up: { y: 60, autoAlpha: 0 },
  fade: { autoAlpha: 0 },
  scale: { scale: 0.92, y: 30, autoAlpha: 0 },
  left: { x: -70, autoAlpha: 0 },
  right: { x: 70, autoAlpha: 0 },
  clip: { clipPath: 'inset(0% 0% 100% 0%)' },
};

/**
 * Scroll-triggered entrance. `<div reveal>` / `<div reveal="scale">`; add
 * `revealStagger` to animate the direct children one after another.
 * Content is never hidden on the server or when motion is off.
 */
@Directive({ selector: '[reveal]' })
export class RevealDirective implements OnDestroy {
  readonly reveal = input<RevealVariant | ''>('');
  readonly revealDelay = input(0);
  readonly revealStagger = input(false, { transform: booleanAttribute });

  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly motion = inject(MotionService);
  private ctx?: gsap.Context;
  private destroyed = false;
  private stops: (() => void)[] = [];

  constructor() {
    afterNextRender(() => void this.setup());
  }

  private async setup(): Promise<void> {
    const kit = await this.motion.ready();
    if (!kit || this.destroyed) return;
    if ((this.motion.isFirstPaint() || this.motion.isLandingPage()) && this.el.getBoundingClientRect().top < innerHeight * 0.9) return;

    const stagger = this.revealStagger();
    const children = Array.from(this.el.children) as HTMLElement[];
    const targets = stagger ? children : this.el;
    const from = FROM[this.reveal() || 'up'];

    const to = { x: 0, y: 0, scale: 1, autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', ease: 'expo.out', clearProps: 'transform,opacity,visibility,clipPath' };
    this.ctx = kit.gsap.context(() => kit.gsap.set(targets, from));

    // Long lists (product grids): each card reveals as it enters, so nothing waits on a long stagger chain.
    if (stagger && children.length > 8) {
      let queue: HTMLElement[] = [];
      let timer = 0;
      const flush = () => {
        const batch = queue;
        queue = [];
        timer = 0;
        kit.gsap.to(batch, { ...to, duration: 1, stagger: 0.07 });
      };
      this.stops = children.map((c) =>
        onceInView(c, () => {
          queue.push(c);
          timer ||= requestAnimationFrame(flush);
        }, '0px 0px -6% 0px'),
      );
      return;
    }

    this.stops = [
      onceInView(this.el, () => {
        kit.gsap.to(targets, { ...to, duration: 1.2, delay: this.revealDelay(), stagger: stagger ? 0.09 : 0 });
      }),
    ];
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stops.forEach((stop) => stop());
    this.ctx?.revert();
  }
}
