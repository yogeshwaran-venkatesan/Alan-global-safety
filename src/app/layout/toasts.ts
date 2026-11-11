import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastService } from '../core/toast';
import { Icon } from '../shared/ui/icon';

@Component({
  selector: 'app-toasts',
  imports: [RouterLink, TranslatePipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pointer-events-none fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[65] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end' },
  template: `
    <div aria-live="polite" class="contents">
      @for (t of toasts.toasts(); track t.id) {
        <div class="toast pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-ink-700/95 py-3 pr-3 pl-4 text-sm text-steel-100 shadow-card backdrop-blur-xl">
          <span class="grid size-7 shrink-0 place-items-center rounded-full bg-hivis-500 text-ink-900"><app-icon name="check" class="size-4" [stroke]="2.4" /></span>
          <span class="flex-1">{{ t.message | translate: t.params }}</span>
          @if (t.link) {
            <a [routerLink]="t.link.path" (click)="toasts.dismiss(t.id)" class="rounded-full px-3 py-1.5 font-semibold text-hivis-500 hover:bg-white/5">{{ t.link.label | translate }}</a>
          }
          <button type="button" (click)="toasts.dismiss(t.id)" class="grid size-8 place-items-center rounded-full text-steel-400 hover:bg-white/5" [attr.aria-label]="'common.dismiss' | translate">
            <app-icon name="close" class="size-4" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast { animation: toast-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
    @keyframes toast-in { from { opacity: 0; transform: translateY(16px) scale(0.96); } }
  `,
})
export class Toasts {
  protected readonly toasts = inject(ToastService);
}
