import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map, startWith } from 'rxjs';
import { catalogItem, categoryBySlug, COMPANY, whatsappUrl } from '../../core/company.config';
import { itemName } from '../../core/catalog-text';
import { buildMessage, EmailResult, EnquiryService } from '../../core/enquiry';
import { pageSeo } from '../../core/page-seo';
import { QuoteLine, QuoteService } from '../../core/quote';
import { trainingByKey } from '../../core/trainings.config';
import { phoneValidator } from '../../shared/forms/validators';
import { MagneticDirective, RevealDirective, SplitRevealDirective } from '../../shared/motion';
import { Icon } from '../../shared/ui/icon';

interface LineView {
  line: QuoteLine;
  icon: string;
  title: string;
  subtitle: string;
  link: string[];
}

@Component({
  selector: 'app-quote-page',
  imports: [RouterLink, ReactiveFormsModule, TranslatePipe, Icon, RevealDirective, SplitRevealDirective, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quote.page.html',
})
export class QuotePage {
  protected readonly quote = inject(QuoteService);
  private readonly translate = inject(TranslateService);
  private readonly enquiry = inject(EnquiryService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly company = COMPANY;

  private readonly lang = toSignal(this.translate.onLangChange.pipe(map((e) => e.lang), startWith('en')));

  /** Lines resolved to display text in the current language. */
  protected readonly views = computed<LineView[]>(() => {
    this.lang();
    return this.quote.lines().map((line) => this.describe(line));
  });

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    company: ['', Validators.maxLength(120)],
    phone: ['', [Validators.required, phoneValidator]],
    email: ['', [Validators.email, Validators.maxLength(120)]],
    location: ['', Validators.maxLength(120)],
    message: ['', Validators.maxLength(1500)],
    /** Honeypot: bots fill it, people never see it. */
    botcheck: [''],
  });

  protected readonly submitted = signal(false);
  protected readonly status = signal<'idle' | 'sending' | 'done'>('idle');
  protected readonly emailResult = signal<EmailResult>('skipped');

  constructor() {
    pageSeo('quote', '/quote');
  }

  protected invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || this.submitted());
  }

  protected step(line: QuoteLine, delta: number): void {
    this.quote.setQty(line.id, line.qty + delta);
  }

  protected setQty(line: QuoteLine, value: string): void {
    this.quote.setQty(line.id, Number(value));
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const v = this.form.getRawValue();
    if (v.botcheck) return;
    const t = (k: string, p?: object) => this.translate.instant(k, p) as string;

    const list = this.views().length
      ? this.views().map((x, i) => `${i + 1}. ${x.title}${x.subtitle ? ' (' + x.subtitle + ')' : ''} × ${x.line.qty}`).join('\n')
      : t('quote.form.noItems');
    const message = buildMessage(t('quote.message.heading', { company: COMPANY.name }), [
      [t('quote.form.name'), v.name],
      [t('quote.form.company'), v.company],
      [t('quote.form.phone'), v.phone],
      [t('quote.form.email'), v.email],
      [t('quote.form.location'), v.location],
      [t('quote.form.message'), v.message],
    ]) + `\n\n${t('quote.message.items')}:\n${list}`;

    this.enquiry.openWhatsApp(whatsappUrl(message));
    this.status.set('sending');
    setTimeout(() => document.getElementById('quote-status')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    this.emailResult.set(
      await this.enquiry.sendEmail({ subject: t('quote.message.subject', { name: v.name, company: v.company || '-' }), name: v.name, phone: v.phone, email: v.email, message }),
    );
    this.status.set('done');
  }

  protected startOver(clearList: boolean): void {
    if (clearList) this.quote.clear();
    this.form.reset();
    this.submitted.set(false);
    this.status.set('idle');
  }

  private describe(line: QuoteLine): LineView {
    const t = (k: string) => this.translate.instant(k);
    if (line.kind === 'training') {
      const tr = trainingByKey(line.ref);
      return { line, icon: tr?.icon ?? 'flame', title: `${tr?.code ?? ''} ${t(`trainings.programmes.${line.ref}.title`)}`.trim(), subtitle: t('quote.kind.training'), link: ['/trainings', line.ref] };
    }
    const cat = categoryBySlug(line.ref);
    const catName = t(`products.categories.${line.ref}.name`);
    if (line.kind === 'item') {
      const item = line.itemId ? catalogItem(line.ref, line.itemId) : undefined;
      const name = item ? itemName(this.translate, line.ref, item) : catName;
      return { line, icon: cat?.icon ?? 'shield', title: name, subtitle: catName, link: ['/products', line.ref] };
    }
    return { line, icon: cat?.icon ?? 'shield', title: catName, subtitle: t('quote.kind.category'), link: ['/products', line.ref] };
  }
}
