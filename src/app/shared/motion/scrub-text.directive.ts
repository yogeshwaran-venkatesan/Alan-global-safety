import { afterNextRender, Directive, effect, ElementRef, inject, input, OnDestroy, Renderer2 } from '@angular/core';
import type { gsap } from 'gsap';
import type { SplitText } from 'gsap/SplitText';
import { MotionService } from '../../core/motion';

/**
 * Words light up one by one as the paragraph scrolls through the viewport.
 * Owns the element's text (like splitReveal) so language switches are safe.
 */
@Directive({ selector: '[scrubText]' })
export class ScrubTextDirective implements OnDestroy {
  readonly scrubText = input.required<string>();
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly motion = inject(MotionService);
  private split?: SplitText;
  private ctx?: gsap.Context;
  private ready = false;

  constructor() {
    effect(() => {
      const text = this.scrubText();
      this.teardown();
      this.renderer.setProperty(this.el, 'textContent', text);
      if (this.ready) void this.build();
    });
    afterNextRender(() => {
      this.ready = true;
      void this.build();
    });
  }

  private async build(): Promise<void> {
    const kit = await this.motion.ready();
    if (!kit) return;
    await this.el.ownerDocument.fonts?.ready;
    this.teardown();
    this.ctx = kit.gsap.context(() => {
      this.split = kit.SplitText.create(this.el, { type: 'words', wordsClass: 'scrub-word' });
      kit.gsap.fromTo(
        this.split.words,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: this.el, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
        },
      );
    });
  }

  private teardown(): void {
    this.ctx?.revert();
    this.ctx = undefined;
    this.split?.revert();
    this.split = undefined;
  }

  ngOnDestroy(): void {
    this.teardown();
  }
}
