import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';

/** Thin hi-vis bar across the top while a page is loading. */
@Component({
  selector: 'app-route-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pointer-events-none fixed inset-x-0 top-0 z-[60] block h-0.5', 'aria-hidden': 'true' },
  template: `@if (loading()) { <div class="h-full origin-left animate-pulse bg-hivis-500"></div> }`,
})
export class RouteProgress {
  protected readonly loading = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((e) => {
        if (e instanceof NavigationStart) {
          clearTimeout(this.timer);
          this.timer = setTimeout(() => this.loading.set(true), 100);
        } else if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) {
          clearTimeout(this.timer);
          this.loading.set(false);
        }
      });
  }
}
