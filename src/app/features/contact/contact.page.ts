import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { COMPANY, mapsDirectionsUrl, mapsEmbedUrl, OFFICES, officeDirectionsUrl, whatsappUrl } from '../../core/company.config';
import { buildMessage, EmailResult, EnquiryService } from '../../core/enquiry';
import { pageSeo } from '../../core/page-seo';
import { officesSchema } from '../../core/schema';
import { phoneValidator } from '../../shared/forms/validators';
import { MagneticDirective, RevealDirective, SplitRevealDirective } from '../../shared/motion';
import { Icon } from '../../shared/ui/icon';
import { SafeUrlPipe } from '../../shared/ui/safe-url.pipe';

type Topic = 'products' | 'training' | 'other';

@Component({
  selector: 'app-contact-page',
  imports: [RouterLink, ReactiveFormsModule, TranslatePipe, Icon, RevealDirective, SplitRevealDirective, MagneticDirective, SafeUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero -->
    <section class="relative isolate overflow-hidden pt-36 pb-16 sm:pt-48 sm:pb-20">
      <div class="grid-lines absolute inset-0 -z-10 opacity-40" aria-hidden="true"></div>
      <div class="absolute -top-40 right-[-10%] -z-10 size-[36rem] rounded-full bg-[radial-gradient(circle,rgba(179,201,43,0.18),transparent_65%)] blur-2xl" aria-hidden="true"></div>
      <div class="container-x">
        <p class="eyebrow" reveal>{{ 'contact.eyebrow' | translate }}</p>
        <h1 class="display mt-5 max-w-4xl text-[clamp(2.5rem,6.4vw,6rem)]" [splitReveal]="'contact.title' | translate"></h1>
        <p class="mt-6 max-w-xl text-lg leading-relaxed text-steel-300" reveal>{{ 'contact.lead' | translate }}</p>
      </div>
    </section>

    <!-- Channels -->
    <section class="pb-20">
      <ul class="container-x grid gap-4 sm:grid-cols-2 lg:grid-cols-4" reveal revealStagger>
        <li class="flex min-w-0 flex-col rounded-[1.5rem] border border-white/[0.08] bg-ink-800/60 p-6">
          <span class="grid size-11 place-items-center rounded-xl bg-hivis-500 text-ink-900"><app-icon name="phone" class="size-5" /></span>
          <h2 class="mt-5 font-bold text-steel-100">{{ 'contact.channels.call.title' | translate }}</h2>
          <p class="mt-1 text-sm text-steel-400">{{ 'contact.channels.call.text' | translate }}</p>
          <div class="mt-auto flex flex-col gap-1 pt-5">
            @for (p of company.phones; track p.href) {
              <a [href]="p.href" class="font-mono text-sm text-steel-100 transition hover:text-hivis-500">{{ p.label }}</a>
            }
          </div>
        </li>
        <li class="flex min-w-0 flex-col rounded-[1.5rem] border border-white/[0.08] bg-ink-800/60 p-6">
          <span class="grid size-11 place-items-center rounded-xl bg-[#25d366] text-ink-900"><app-icon name="whatsapp" class="size-5" /></span>
          <h2 class="mt-5 font-bold text-steel-100">{{ 'contact.channels.whatsapp.title' | translate }}</h2>
          <p class="mt-1 text-sm text-steel-400">{{ 'contact.channels.whatsapp.text' | translate }}</p>
          <a [href]="waHello()" target="_blank" rel="noopener" class="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-steel-100 transition hover:text-hivis-500">
            {{ 'contact.channels.whatsapp.cta' | translate }} <app-icon name="arrowUpRight" class="size-4" />
          </a>
        </li>
        <li class="flex min-w-0 flex-col rounded-[1.5rem] border border-white/[0.08] bg-ink-800/60 p-6">
          <span class="grid size-11 place-items-center rounded-xl bg-steel-100 text-ink-900"><app-icon name="mail" class="size-5" /></span>
          <h2 class="mt-5 font-bold text-steel-100">{{ 'contact.channels.email.title' | translate }}</h2>
          <p class="mt-1 text-sm text-steel-400">{{ 'contact.channels.email.text' | translate }}</p>
          <div class="mt-auto flex flex-col gap-1 pt-5 text-sm">
            <a [href]="'mailto:' + company.emails.info" class="break-all text-steel-100 transition hover:text-hivis-500">{{ company.emails.info }}</a>
            <a [href]="'mailto:' + company.emails.training" class="break-all text-steel-100 transition hover:text-hivis-500">{{ company.emails.training }}</a>
          </div>
        </li>
        <li class="flex min-w-0 flex-col rounded-[1.5rem] border border-white/[0.08] bg-ink-800/60 p-6">
          <span class="grid size-11 place-items-center rounded-xl bg-signal-500 text-white"><app-icon name="pin" class="size-5" /></span>
          <h2 class="mt-5 font-bold text-steel-100">{{ 'contact.channels.visit.title' | translate }}</h2>
          <p class="mt-1 text-sm leading-relaxed text-steel-400">{{ 'contact.channels.visit.text' | translate }}</p>
          <a routerLink="/contact" fragment="offices" class="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-steel-100 transition hover:text-hivis-500">
            {{ 'contact.channels.visit.cta' | translate }} <app-icon name="arrow" class="size-4 rotate-90" />
          </a>
        </li>
      </ul>
    </section>

    <!-- Offices -->
    <section id="offices" class="scroll-mt-28 pb-20">
      <div class="container-x">
        <p class="eyebrow" reveal>{{ 'contact.offices.eyebrow' | translate }}</p>
        <h2 class="display mt-4 text-[clamp(1.9rem,4vw,3.25rem)]" [splitReveal]="'contact.offices.title' | translate"></h2>
        <div class="mt-10 grid gap-4 lg:grid-cols-2" reveal revealStagger>
          @for (o of offices; track o.key; let i = $index) {
            <article class="relative min-w-0 overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-br from-ink-700 to-ink-800 p-6 sm:p-8">
              <span class="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-hivis-500 to-signal-500" aria-hidden="true"></span>
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="font-mono text-[0.7rem] tracking-[0.2em] text-hivis-500 uppercase">{{ (i === 0 ? 'contact.offices.head' : 'contact.offices.branch') | translate }}</p>
                  <h3 class="display mt-2 text-3xl text-steel-100">{{ 'offices.' + o.key | translate }}</h3>
                </div>
                <span class="grid size-12 shrink-0 place-items-center rounded-2xl bg-hivis-500 text-ink-900"><app-icon name="pin" class="size-6" /></span>
              </div>
              <address class="mt-5 text-[0.95rem] leading-relaxed not-italic text-steel-300">
                @for (l of o.lines; track l) { <span class="block">{{ l }}</span> }
              </address>
              <div class="mt-6 grid gap-2 border-t border-white/[0.08] pt-5 text-sm">
                @for (p of o.phones; track p.href) {
                  <a [href]="p.href" class="flex items-center gap-3 text-steel-100 hover:text-hivis-500"><app-icon name="phone" class="size-4 text-hivis-500" /> {{ p.label }}</a>
                }
                <a [href]="'mailto:' + o.email" class="flex items-center gap-3 break-all text-steel-100 hover:text-hivis-500"><app-icon name="mail" class="size-4 text-hivis-500" /> {{ o.email }}</a>
                <p class="font-mono text-xs tracking-wider text-steel-400">GSTIN {{ o.gstin }}</p>
              </div>
              <a [href]="dir(o)" target="_blank" rel="noopener" class="btn btn-ghost mt-6">{{ 'contact.offices.directions' | translate }} <app-icon name="arrowUpRight" class="size-4" /></a>
            </article>
          }
        </div>
      </div>
    </section>

    <!-- Form + map -->
    <section class="pb-24 sm:pb-32">
      <div class="container-x grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        @if (status() === 'idle') {
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="min-w-0 rounded-[2rem] bg-steel-100 p-5 text-ink-900 sm:p-10" reveal>
            <h2 class="display text-2xl !text-ink-900 sm:text-3xl">{{ 'contact.form.title' | translate }}</h2>
            <p class="mt-2 text-sm text-ink-900/75">{{ 'quote.form.lead' | translate }}</p>

            <fieldset class="mt-7">
              <legend class="field-label">{{ 'contact.form.topic' | translate }}</legend>
              <div class="mt-2 flex flex-wrap gap-2">
                @for (t of topics; track t) {
                  <label class="cursor-pointer">
                    <input type="radio" class="peer sr-only" formControlName="topic" [value]="t" />
                    <span class="inline-flex rounded-full border border-ink-900/15 px-4 py-2 text-sm font-semibold transition peer-checked:border-ink-900 peer-checked:bg-ink-900 peer-checked:text-hivis-500 peer-focus-visible:ring-2 peer-focus-visible:ring-hivis-600">{{ 'contact.form.topics.' + t | translate }}</span>
                  </label>
                }
              </div>
            </fieldset>

            <div class="mt-6 grid gap-5 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label for="c-name" class="field-label">{{ 'quote.form.name' | translate }} *</label>
                <input id="c-name" class="field" formControlName="name" autocomplete="name" [attr.aria-invalid]="invalid('name')" />
                @if (invalid('name')) { <p class="field-error">{{ 'form.errors.name' | translate }}</p> }
              </div>
              <div>
                <label for="c-phone" class="field-label">{{ 'quote.form.phone' | translate }} *</label>
                <input id="c-phone" type="tel" class="field" formControlName="phone" autocomplete="tel" placeholder="+91 98765 43210" [attr.aria-invalid]="invalid('phone')" />
                @if (invalid('phone')) { <p class="field-error">{{ 'form.errors.phone' | translate }}</p> }
              </div>
              <div>
                <label for="c-email" class="field-label">{{ 'quote.form.email' | translate }}</label>
                <input id="c-email" type="email" class="field" formControlName="email" autocomplete="email" [attr.aria-invalid]="invalid('email')" />
                @if (invalid('email')) { <p class="field-error">{{ 'form.errors.email' | translate }}</p> }
              </div>
              <div class="sm:col-span-2">
                <label for="c-message" class="field-label">{{ 'contact.form.message' | translate }} *</label>
                <textarea id="c-message" rows="5" class="field resize-y" formControlName="message" [placeholder]="'contact.form.messageHint' | translate" [attr.aria-invalid]="invalid('message')"></textarea>
                @if (invalid('message')) { <p class="field-error">{{ 'contact.form.messageError' | translate }}</p> }
              </div>
              <input type="text" formControlName="botcheck" class="hidden" tabindex="-1" autocomplete="off" aria-hidden="true" />
            </div>

            <div class="mt-8 flex flex-wrap items-center justify-between gap-4">
              <p class="max-w-xs text-xs leading-relaxed text-ink-900/75">{{ 'contact.form.how' | translate }}</p>
              <button type="submit" magnetic class="btn btn-dark">
                <app-icon name="whatsapp" class="size-4" /> {{ 'contact.form.submit' | translate }}
              </button>
            </div>
          </form>
        } @else {
          <div id="contact-status" class="grid min-w-0 place-items-center rounded-[2rem] bg-steel-100 p-10 text-center text-ink-900 sm:p-14" role="status" aria-live="polite">
            @if (status() === 'sending') {
              <p class="text-ink-900/75">{{ 'form.sending' | translate }}</p>
            } @else {
              <div>
                <span class="mx-auto grid size-16 place-items-center rounded-full bg-hivis-500"><app-icon name="check" class="size-8" [stroke]="2.2" /></span>
                <h2 class="display mt-6 text-3xl !text-ink-900">{{ 'contact.done.title' | translate }}</h2>
                <p class="mx-auto mt-3 max-w-sm text-ink-900/75">{{ 'contact.done.text' | translate }}</p>
                @if (emailResult() === 'sent') { <p class="mt-2 text-sm text-ink-900/80">{{ 'form.emailSent' | translate }}</p> }
                @if (emailResult() === 'failed') { <p class="mt-2 text-sm font-semibold text-danger-600">{{ 'form.emailFailed' | translate }}</p> }
                <div class="mt-8 flex flex-wrap justify-center gap-3">
                  <button type="button" (click)="startOver()" class="btn btn-dark">{{ 'contact.done.again' | translate }}</button>
                  <a routerLink="/products" class="btn border border-ink-900/20">{{ 'contact.done.browse' | translate }}</a>
                </div>
              </div>
            }
          </div>
        }

        <div class="relative min-h-[22rem] min-w-0 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-ink-800" reveal="scale">
          <iframe [src]="mapUrl | safeUrl" [title]="'contact.mapTitle' | translate" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
            class="absolute inset-0 size-full grayscale-[0.6] invert-[0.92] hue-rotate-180 contrast-[0.9]"></iframe>
          <div class="pointer-events-none absolute inset-x-4 bottom-4 flex justify-start">
            <a [href]="directions" target="_blank" rel="noopener" class="pointer-events-auto btn btn-hivis shadow-card">
              <app-icon name="pin" class="size-4" /> {{ 'contact.offices.directions' | translate }}
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ContactPage {
  private readonly translate = inject(TranslateService);
  private readonly enquiry = inject(EnquiryService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly company = COMPANY;
  protected readonly mapUrl = mapsEmbedUrl();
  protected readonly directions = mapsDirectionsUrl();
  protected readonly offices = OFFICES;
  protected readonly dir = officeDirectionsUrl;
  protected readonly topics: Topic[] = ['products', 'training', 'other'];

  protected readonly form = this.fb.group({
    topic: ['products' as Topic],
    name: ['', [Validators.required, Validators.maxLength(80)]],
    phone: ['', [Validators.required, phoneValidator]],
    email: ['', [Validators.email, Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.maxLength(1500)]],
    /** Honeypot: bots fill it, people never see it. */
    botcheck: [''],
  });

  protected readonly submitted = signal(false);
  protected readonly status = signal<'idle' | 'sending' | 'done'>('idle');
  protected readonly emailResult = signal<EmailResult>('skipped');

  constructor() {
    pageSeo('contact', '/contact', { structuredData: (t) => [{ '@type': 'ContactPage', name: t('seo.contact.title') }, ...officesSchema()] });
  }

  protected waHello(): string {
    return whatsappUrl(this.translate.instant('contact.channels.whatsapp.hello') as string);
  }

  protected invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || this.submitted());
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
    const topic = t('contact.form.topics.' + v.topic);
    const message = buildMessage(t('contact.message.heading', { company: COMPANY.name }), [
      [t('contact.form.topic'), topic],
      [t('quote.form.name'), v.name],
      [t('quote.form.phone'), v.phone],
      [t('quote.form.email'), v.email],
      [t('contact.form.message'), v.message],
    ]);

    this.enquiry.openWhatsApp(whatsappUrl(message));
    this.status.set('sending');
    setTimeout(() => document.getElementById('contact-status')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    this.emailResult.set(
      await this.enquiry.sendEmail({ subject: t('contact.message.subject', { name: v.name, topic }), name: v.name, phone: v.phone, email: v.email, message }),
    );
    this.status.set('done');
  }

  protected startOver(): void {
    this.form.reset();
    this.submitted.set(false);
    this.status.set('idle');
  }
}
