import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { QuoteService, trainingLineId } from '../../core/quote';
import { ToastService } from '../../core/toast';
import { Training } from '../../core/trainings.config';
import { Icon } from './icon';

/** Training programme card: giant outlined code, theme, title, and "book" toggle. */
@Component({
  selector: 'app-training-card',
  imports: [RouterLink, TranslatePipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
  template: `
    <article class="group relative isolate flex h-full min-h-[19rem] flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-ink-800 p-7 transition duration-500 hover:-translate-y-1.5 hover:border-hivis-500/50 hover:shadow-glow">
      <!-- outlined code number in the background -->
      <span class="display pointer-events-none absolute -right-2 -bottom-6 -z-10 text-[7.5rem] leading-none text-transparent transition duration-700 [-webkit-text-stroke:1px_rgb(255_255_255/0.07)] group-hover:[-webkit-text-stroke:1px_rgb(179_201_43/0.35)]" aria-hidden="true">{{ training().code.replace('ATP', '') }}</span>
      <div class="flex items-start justify-between gap-3">
        <span class="grid size-12 place-items-center rounded-2xl bg-white/[0.04] text-hivis-500 transition duration-500 group-hover:bg-hivis-500 group-hover:text-ink-900">
          <app-icon [name]="training().icon" class="size-6" />
        </span>
        <span class="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[0.62rem] tracking-wider text-steel-400 uppercase">{{ 'trainings.themes.' + training().theme | translate }}</span>
      </div>
      <p class="mt-6 font-mono text-sm text-hivis-500">{{ training().code }}</p>
      <h3 class="mt-2 text-xl leading-snug font-bold text-steel-100">
        <a [routerLink]="['/trainings', training().key]" class="after:absolute after:inset-0 after:content-['']">{{ 'trainings.programmes.' + training().key + '.title' | translate }}</a>
      </h3>
      <p class="mt-3 line-clamp-2 pr-10 text-sm text-steel-400">{{ 'trainings.programmes.' + training().key + '.short' | translate }}</p>
      <p class="mt-auto pt-6 font-mono text-xs text-steel-400">{{ 'trainings.topics' | translate: { count: topics() } }}</p>
      <button type="button" (click)="toggle()" [attr.aria-pressed]="booked()"
              [attr.aria-label]="(booked() ? 'quote.removeNamed' : 'quote.addNamed') | translate: { name: training().code }"
              class="absolute right-5 bottom-5 z-10 grid size-11 place-items-center rounded-full border transition duration-500"
              [class]="booked() ? 'border-hivis-500 bg-hivis-500 text-ink-900' : 'border-white/15 text-steel-200 hover:border-hivis-500 hover:text-hivis-500'">
        <app-icon [name]="booked() ? 'check' : 'plus'" class="size-5" [stroke]="2" />
      </button>
    </article>
  `,
})
export class TrainingCard {
  readonly training = input.required<Training>();
  private readonly quote = inject(QuoteService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  protected readonly booked = computed(() => this.quote.lines() && this.quote.has(trainingLineId(this.training().key)));

  protected topics(): number {
    const o = this.translate.instant(`trainings.programmes.${this.training().key}.objectives`);
    return Array.isArray(o) ? o.length : 0;
  }

  protected toggle(): void {
    const t = this.training();
    if (this.quote.toggle({ id: trainingLineId(t.key), kind: 'training', ref: t.key })) {
      this.toast.show({ message: 'quote.added', params: { name: t.code }, link: { path: '/quote', label: 'quote.view' } });
    }
  }
}
