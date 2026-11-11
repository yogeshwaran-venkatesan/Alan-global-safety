import { afterNextRender, Directive, ElementRef, inject, input, OnDestroy } from '@angular/core';
import type { gsap } from 'gsap';
import { MotionService } from '../../core/motion';

/** Drifts the element vertically while its section scrolls past. `[parallax]="-20"` = yPercent travel. */
@Directive({ selector: '[parallax]' })
export class ParallaxDirective implements OnDestroy {
  readonly parallax = input(15);
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
    this.ctx = kit.gsap.context(() => {
      kit.gsap.fromTo(
        this.el,
        { yPercent: -this.parallax() / 2 },
        {
          yPercent: this.parallax() / 2,
          ease: 'none',
          scrollTrigger: { trigger: this.el.parentElement ?? this.el, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.ctx?.revert();
  }
}
