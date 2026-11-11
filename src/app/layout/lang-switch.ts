import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Lang, LANGUAGES, LanguageService } from '../core/i18n';
import { Icon } from '../shared/ui/icon';

/** Compact language menu: EN · മല · தமி */
@Component({
  selector: 'app-lang-switch',
  imports: [TranslatePipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block', '(document:click)': 'outside($event)', '(keydown.escape)': 'open.set(false)' },
  template: `
    @if (inline()) {
      <div class="flex gap-2" role="group" [attr.aria-label]="'nav.language' | translate">
        @for (l of languages; track l.code) {
          <button type="button" (click)="choose(l.code)" [attr.aria-pressed]="lang.current() === l.code" [attr.lang]="l.code"
                  class="min-h-11 rounded-full border px-4 text-sm font-semibold transition"
                  [class]="lang.current() === l.code ? 'border-hivis-500 bg-hivis-500 text-ink-900' : 'border-white/15 text-steel-200 hover:border-white/40'">
            {{ l.name }}
          </button>
        }
      </div>
    } @else {
      <button type="button" (click)="open.set(!open())" [attr.aria-expanded]="open()" aria-haspopup="true"
              class="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-steel-200 transition hover:bg-white/5 hover:text-white"
              [attr.aria-label]="'nav.language' | translate">
        <app-icon name="globe" class="size-4" />
        <span [attr.lang]="lang.current()">{{ current().short }}</span>
        <app-icon name="chevronDown" class="size-3.5 transition" [class.rotate-180]="open()" />
      </button>
      <ul class="absolute top-full right-0 mt-2 w-44 origin-top-right rounded-2xl border border-white/10 bg-ink-800/95 p-1.5 shadow-card backdrop-blur-xl transition duration-300"
          [class]="open() ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0'" role="menu">
        @for (l of languages; track l.code) {
          <li role="none">
            <button type="button" role="menuitemradio" [attr.aria-checked]="lang.current() === l.code" (click)="choose(l.code)" [attr.lang]="l.code"
                    class="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-white/5"
                    [class.text-hivis-500]="lang.current() === l.code">
              {{ l.name }}
              @if (lang.current() === l.code) { <app-icon name="check" class="size-4" /> }
            </button>
          </li>
        }
      </ul>
    }
  `,
})
export class LangSwitch {
  readonly inline = input(false);
  protected readonly lang = inject(LanguageService);
  protected readonly languages = LANGUAGES;
  protected readonly open = signal(false);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  protected current() {
    return LANGUAGES.find((l) => l.code === this.lang.current()) ?? LANGUAGES[0];
  }

  protected choose(code: Lang): void {
    this.open.set(false);
    void this.lang.use(code);
  }

  protected outside(e: Event): void {
    if (this.open() && !this.host.contains(e.target as Node)) this.open.set(false);
  }
}
