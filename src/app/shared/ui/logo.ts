import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The company's logo badge with the name beside it (header and footer). */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center gap-3' },
  template: `
    <img src="images/logo/logo-96.webp" srcset="images/logo/logo-96.webp 1x, images/logo/logo-192.webp 2x" alt="" width="48" height="48"
         class="size-11 shrink-0 rounded-full ring-1 ring-white/15 sm:size-12" decoding="async" fetchpriority="high" />
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
