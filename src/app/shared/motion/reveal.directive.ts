import { afterNextRender, booleanAttribute, Directive, ElementRef, inject, input, OnDestroy } from '@angular/core';
import type { gsap } from 'gsap';
import { MotionService } from '../../core/motion';

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

  constructor() {
    afterNextRender(() => void this.setup());
  }

  private async setup(): Promise<void> {
    const kit = await this.motion.ready();
    if (!kit || this.destroyed) return;
    if (this.motion.isFirstPaint() && this.el.getBoundingClientRect().top < innerHeight * 0.9) return;

    const stagger = this.revealStagger();
    const children = Array.from(this.el.children) as HTMLElement[];
    const targets = stagger ? children : this.el;
    const from = FROM[this.reveal() || 'up'];

    // Long lists (product grids): reveal row by row as each enters the viewport,
    // so nothing further down waits on a long stagger chain.
    if (stagger && children.length > 8) {
      this.ctx = kit.gsap.context(() => {
        kit.gsap.set(children, from);
        kit.ScrollTrigger.batch(children, {
          start: 'top 94%',
          once: true,
          onEnter: (batch) =>
            kit.gsap.to(batch, { x: 0, y: 0, scale: 1, autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.out', stagger: 0.07, clearProps: 'transform,opacity,visibility,clipPath' }),
        });
      });
      return;
    }

    this.ctx = kit.gsap.context(() => {
      kit.gsap.from(targets, {
        ...from,
        duration: 1.2,
        delay: this.revealDelay(),
        stagger: stagger ? 0.09 : 0,
        clearProps: 'transform,opacity,visibility,clipPath',
        scrollTrigger: { trigger: this.el, start: 'top 88%', once: true },
      });
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.ctx?.revert();
  }
}
