import { afterNextRender, booleanAttribute, Directive, effect, ElementRef, inject, input, OnDestroy, Renderer2 } from '@angular/core';
import type { SplitText } from 'gsap/SplitText';
import { MotionService } from '../../core/motion';

/**
 * Headline that rises line by line from behind a mask.
 * Usage: `<h2 [splitReveal]="'home.title' | translate"></h2>` — the directive owns
 * the element's text, so a language switch re-renders it safely (SplitText
 * rewrites the DOM, which would otherwise break Angular's text binding).
 * `splitIntro` plays immediately (hero) instead of on scroll.
 */
@Directive({ selector: '[splitReveal]' })
export class SplitRevealDirective implements OnDestroy {
  readonly splitReveal = input.required<string>();
  readonly splitIntro = input(false, { transform: booleanAttribute });
  readonly splitDelay = input(0);

  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly motion = inject(MotionService);
  private split?: SplitText;
  private played = false;
  private destroyed = false;

  constructor() {
    // Text is written on the server too, so prerendered HTML has the real headline.
    effect(() => {
      const text = this.splitReveal();
      this.split?.revert();
      this.split = undefined;
      this.renderer.setProperty(this.el, 'textContent', text);
    });
    afterNextRender(() => void this.animate());
  }

  private async animate(): Promise<void> {
    const kit = await this.motion.ready();
    if (!kit || this.destroyed || this.played) {
      if (this.splitIntro()) this.el.style.opacity = '1';
      return;
    }
    const intro = this.splitIntro();
    if (!intro && this.motion.isFirstPaint() && this.el.getBoundingClientRect().top < innerHeight * 0.9) return;
    await this.document().fonts?.ready;
    if (this.destroyed) return;

    this.played = true;
    this.split = kit.SplitText.create(this.el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit: (self) => {
        kit.gsap.set(this.el, { opacity: 1 });
        return kit.gsap.from(self.lines, {
          yPercent: 115,
          rotate: 2,
          duration: 1.3,
          stagger: 0.1,
          delay: this.splitDelay(),
          scrollTrigger: intro ? undefined : { trigger: this.el, start: 'top 90%', once: true },
        });
      },
    });
  }

  private document(): Document {
    return this.el.ownerDocument;
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.split?.revert();
  }
}
