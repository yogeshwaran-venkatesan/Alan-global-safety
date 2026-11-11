import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Pitch wordmark: a hi-vis shield with a hard-hat silhouette.
 * CONFIRM: swap for the client's own logo if they want to keep it.
 */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center gap-3' },
  template: `
    <svg viewBox="0 0 40 44" class="h-10 w-9 shrink-0" aria-hidden="true">
      <path d="M20 1 38 7.5v14C38 33 30.4 40.5 20 43 9.6 40.5 2 33 2 21.5v-14Z" fill="#ffc21a" />
      <path d="M11 28c0-6 4-10.5 9-10.5s9 4.5 9 10.5Z" fill="#0b0d10" />
      <rect x="18.4" y="12.5" width="3.2" height="7" rx="1.6" fill="#0b0d10" />
      <rect x="8.5" y="27.5" width="23" height="3.6" rx="1.8" fill="#0b0d10" />
    </svg>
    @if (!compact()) {
      <span class="leading-none">
        <span class="display block text-[1.05rem] tracking-[0.02em] text-steel-100">Alan Global</span>
        <span class="mt-1 block font-mono text-[0.62rem] font-semibold tracking-[0.42em] text-hivis-500 uppercase">Safety</span>
      </span>
    }
  `,
})
export class Logo {
  readonly compact = input(false);
}
