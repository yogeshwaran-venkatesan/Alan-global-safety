import { afterNextRender, Directive, effect, ElementRef, inject, input, OnDestroy, Renderer2 } from '@angular/core';
import type { gsap } from 'gsap';
import { MotionService } from '../../core/motion';

/** Counts from 0 to the value when scrolled into view. The final number is in the prerendered HTML. */
@Directive({ selector: '[countUp]' })
export class CountUpDirective implements OnDestroy {
  readonly countUp = input.required<number>();
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly motion = inject(MotionService);
  private ctx?: gsap.Context;
  private destroyed = false;

  constructor() {
    effect(() => this.renderer.setProperty(this.el, 'textContent', String(this.countUp())));
    afterNextRender(() => void this.setup());
  }

  private async setup(): Promise<void> {
    const kit = await this.motion.ready();
    if (!kit || this.destroyed) return;
    const target = this.countUp();
    const state = { n: 0 };
    this.ctx = kit.gsap.context(() => {
      kit.gsap.to(state, {
        n: target,
        duration: 2,
        ease: 'power3.out',
        onStart: () => (this.el.textContent = '0'),
        onUpdate: () => (this.el.textContent = String(Math.round(state.n))),
        scrollTrigger: { trigger: this.el, start: 'top 92%', once: true },
      });
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.ctx?.revert();
  }
}
