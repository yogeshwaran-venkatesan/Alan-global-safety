import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, viewChild } from '@angular/core';
import { MotionService } from '../core/motion';

/**
 * Desktop-only custom cursor: a small dot that tracks the pointer exactly and a
 * ring that follows with inertia, growing over anything clickable.
 * Hidden on touch devices and when motion is reduced (native cursor stays).
 */
@Component({
  selector: 'app-cursor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', class: 'pointer-events-none fixed inset-0 z-[90] hidden' },
  template: `
    <div #ring class="absolute top-0 left-0 -mt-5 -ml-5 size-10 rounded-full border border-hivis-500/70 opacity-0 transition-[width,height,margin,background-color,border-color,opacity] duration-300 ease-out"></div>
    <div #dot class="absolute top-0 left-0 -mt-1 -ml-1 size-2 rounded-full bg-hivis-500 opacity-0 transition-opacity duration-300"></div>
  `,
})
export class Cursor implements OnDestroy {
  private readonly ring = viewChild.required<ElementRef<HTMLElement>>('ring');
  private readonly dot = viewChild.required<ElementRef<HTMLElement>>('dot');
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly motion = inject(MotionService);
  private cleanup?: () => void;

  constructor() {
    afterNextRender(() => void this.setup());
  }

  private async setup(): Promise<void> {
    if (!matchMedia('(pointer: fine) and (hover: hover)').matches) return;
    const kit = await this.motion.ready();
    if (!kit) return;
    const ring = this.ring().nativeElement;
    const dot = this.dot().nativeElement;
    this.host.classList.remove('hidden');

    const rx = kit.gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' });
    const ry = kit.gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' });
    const dx = kit.gsap.quickTo(dot, 'x', { duration: 0.08 });
    const dy = kit.gsap.quickTo(dot, 'y', { duration: 0.08 });

    const move = (e: PointerEvent) => {
      rx(e.clientX);
      ry(e.clientY);
      dx(e.clientX);
      dy(e.clientY);
      ring.style.opacity = dot.style.opacity = '1';
      const hot = (e.target as Element | null)?.closest?.('a, button, [role="button"], input, select, textarea, label');
      ring.classList.toggle('!size-16', !!hot);
      ring.classList.toggle('!-mt-8', !!hot);
      ring.classList.toggle('!-ml-8', !!hot);
      ring.classList.toggle('!bg-hivis-500/10', !!hot);
    };
    const leave = () => (ring.style.opacity = dot.style.opacity = '0');
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    this.cleanup = () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
    };
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }
}
