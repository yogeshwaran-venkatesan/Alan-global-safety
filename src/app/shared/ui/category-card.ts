import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ProductCategory, catalogItems } from '../../core/company.config';
import { itemName } from '../../core/catalog-text';
import { categoryLineId, QuoteService } from '../../core/quote';
import { ToastService } from '../../core/toast';
import { Icon } from './icon';

/** Product category card with an "add to quote" toggle. Used by the catalogue and related lists. */
@Component({
  selector: 'app-category-card',
  imports: [RouterLink, TranslatePipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <article class="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-ink-800 transition duration-500 hover:-translate-y-1.5 hover:border-hivis-500/50 hover:shadow-glow">
      <!-- Product photo on a light "catalogue plate"; multiply blends the photo's white background away -->
      <div class="relative aspect-[5/4] overflow-hidden bg-paper">
        @if (category().image) {
          <img [src]="category().image" [alt]="'products.categories.' + category().slug + '.name' | translate" width="480" height="480" loading="lazy" decoding="async"
               [class]="category().photo ? 'size-full object-cover transition duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110' : 'size-full object-contain p-7 mix-blend-multiply transition duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110'" />
        } @else {
          <div class="grid size-full place-items-center"><span class="grid size-16 place-items-center rounded-2xl bg-ink-900/[0.06] text-ink-900/70"><app-icon [name]="category().icon" class="size-8" /></span></div>
        }
        <span class="absolute top-4 left-4 font-mono text-xs text-ink-900/75">{{ number() }}</span>
        <span class="absolute top-3.5 right-3.5 rounded-full bg-ink-900/[0.06] px-2.5 py-1 font-mono text-[0.6rem] tracking-wider text-ink-900/75 uppercase">{{ 'products.groups.' + category().group | translate }}</span>
        <span class="absolute bottom-3.5 left-3.5 grid size-9 place-items-center rounded-xl bg-ink-900 text-hivis-500 transition duration-500 group-hover:rotate-[-8deg]"><app-icon [name]="category().icon" class="size-5" /></span>
      </div>
      <div class="flex flex-1 flex-col p-6 pr-16">
        <h3 class="display text-lg leading-tight text-steel-100">
          <!-- Stretched link: the whole card opens the category -->
          <a [routerLink]="['/products', category().slug]" class="after:absolute after:inset-0 after:content-['']">{{ 'products.categories.' + category().slug + '.name' | translate }}</a>
        </h3>
        <p class="mt-2 line-clamp-2 text-sm text-steel-400">{{ items() }}</p>
      </div>
      <button type="button" (click)="toggle()" [attr.aria-pressed]="inQuote()"
              [attr.aria-label]="(inQuote() ? 'quote.removeNamed' : 'quote.addNamed') | translate: { name: ('products.categories.' + category().slug + '.name' | translate) }"
              class="absolute right-4 bottom-5 z-10 grid size-11 place-items-center rounded-full border transition duration-500"
              [class]="inQuote() ? 'border-hivis-500 bg-hivis-500 text-ink-900' : 'border-white/15 text-steel-200 hover:border-hivis-500 hover:text-hivis-500'">
        <app-icon [name]="inQuote() ? 'check' : 'plus'" class="size-5" [stroke]="2" />
      </button>
    </article>
  `,
})
export class CategoryCard {
  readonly category = input.required<ProductCategory>();
  readonly index = input(0);

  private readonly quote = inject(QuoteService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  protected readonly number = computed(() => String(this.index() + 1).padStart(2, '0'));
  protected readonly inQuote = computed(() => this.quote.lines() && this.quote.has(categoryLineId(this.category().slug)));

  protected items(): string {
    const slug = this.category().slug;
    return catalogItems(slug).slice(0, 4).map((i) => itemName(this.translate, slug, i)).join(' · ');
  }

  protected toggle(): void {
    const slug = this.category().slug;
    const added = this.quote.toggle({ id: categoryLineId(slug), kind: 'category', ref: slug });
    if (added) {
      this.toast.show({
        message: 'quote.added',
        params: { name: this.translate.instant(`products.categories.${slug}.name`) },
        link: { path: '/quote', label: 'quote.view' },
      });
    }
  }
}
