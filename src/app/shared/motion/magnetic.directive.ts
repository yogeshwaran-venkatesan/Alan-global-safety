import { afterNextRender, Directive, ElementRef, inject, input, OnDestroy } from '@angular/core';
import { MotionService } from '../../core/motion';

/** The element leans toward the pointer and springs back (fine pointers only). */
@Directive({ selector: '[magnetic]' })
export class MagneticDirective implements OnDestroy {
  readonly magnetic = input(0.35, { transform: (v: unknown) => (v === '' || v == null ? 0.35 : Number(v)) });
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly motion = inject(MotionService);
  private cleanup?: () => void;

  constructor() {
    afterNextRender(() => void this.setup());
  }

  private async setup(): Promise<void> {
    if (!matchMedia('(pointer: fine)').matches) return;
    const kit = await this.motion.ready();
    if (!kit) return;
    const x = kit.gsap.quickTo(this.el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const y = kit.gsap.quickTo(this.el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const move = (e: PointerEvent) => {
      const r = this.el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * this.magnetic());
      y((e.clientY - (r.top + r.height / 2)) * this.magnetic());
    };
    const leave = () => {
      x(0);
      y(0);
    };
    this.el.addEventListener('pointermove', move);
    this.el.addEventListener('pointerleave', leave);
    this.cleanup = () => {
      this.el.removeEventListener('pointermove', move);
      this.el.removeEventListener('pointerleave', leave);
    };
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }
}
