import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { COMPANY, PRODUCT_CATEGORIES, PRODUCT_GROUPS } from '../core/company.config';
import { QuoteService } from '../core/quote';
import { MagneticDirective } from '../shared/motion';
import { Icon } from '../shared/ui/icon';
import { Logo } from '../shared/ui/logo';
import { LangSwitch } from './lang-switch';
import { NAV } from './nav';

/**
 * Smart header: transparent at the top, frosted once you scroll, slides away
 * while scrolling down and returns on the way up. Products open a mega-menu
 * on desktop; phones get a full-screen menu.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, Icon, Logo, LangSwitch, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'banner',
    class: 'fixed inset-x-0 top-0 z-50 block transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]',
    '[class.-translate-y-full]': 'hidden() && !menu() && !mega()',
    '(window:scroll)': 'onScroll()',
    '(keydown.escape)': 'closeAll()',
  },
  template: `
    <div class="absolute inset-0 -z-10 transition duration-500" aria-hidden="true"
         [class]="solid() || mega() ? 'glass border-b border-white/[0.06]' : 'bg-gradient-to-b from-ink-950/70 to-transparent'"></div>

    <div class="container-x flex h-20 items-center justify-between gap-6">
      <a routerLink="/" class="shrink-0" (click)="closeAll()"><app-logo /><span class="sr-only">{{ 'nav.home' | translate }}</span></a>

      <nav class="hidden items-center gap-1 lg:flex" [attr.aria-label]="'nav.main' | translate">
        @for (item of nav; track item.path) {
          @if (item.path === '/products') {
            <div class="relative" (pointerenter)="openMega()" (pointerleave)="closeMegaSoon()">
              <button type="button" class="group flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-steel-200 transition hover:text-white"
                      [class.!text-hivis-500]="mega()" (click)="mega() ? mega.set(false) : openMega()" [attr.aria-expanded]="mega()" aria-controls="mega-menu">
                {{ item.label | translate }}
                <app-icon name="chevronDown" class="size-3.5 transition duration-300" [class.rotate-180]="mega()" />
              </button>
            </div>
          } @else {
            <a [routerLink]="item.path" routerLinkActive="!text-hivis-500 after:scale-x-100"
               class="relative flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-steel-200 transition after:absolute after:inset-x-4 after:bottom-2 after:h-px after:origin-left after:scale-x-0 after:bg-hivis-500 after:transition-transform after:duration-500 hover:text-white hover:after:scale-x-100">
              {{ item.label | translate }}
            </a>
          }
        }
      </nav>

      <div class="flex items-center gap-1 sm:gap-2">
        <app-lang-switch class="hidden sm:block" />
        <a routerLink="/quote" magnetic class="btn btn-hivis hidden !min-h-11 !px-5 text-sm sm:inline-flex">
          {{ 'nav.quote' | translate }}
          @if (quote.count()) {
            <span class="grid min-w-6 place-items-center rounded-full bg-ink-900 px-1.5 py-0.5 font-mono text-xs text-hivis-500" [attr.aria-label]="'quote.itemsCount' | translate: { count: quote.count() }">{{ quote.count() }}</span>
          } @else {
            <app-icon name="arrowUpRight" class="size-4" />
          }
        </a>
        <button type="button" class="grid size-11 place-items-center rounded-full text-steel-100 transition hover:bg-white/5 lg:hidden"
                (click)="menu.set(!menu())" [attr.aria-expanded]="menu()" aria-controls="mobile-menu"
                [attr.aria-label]="(menu() ? 'nav.closeMenu' : 'nav.openMenu') | translate">
          <app-icon [name]="menu() ? 'close' : 'menu'" class="size-6" />
        </button>
      </div>
    </div>

    <!-- ===== Desktop mega-menu ===== -->
    <!-- The wrapper never catches the pointer; only the open panel does (otherwise the closed
         menu would block clicks on the page beneath the header). -->
    <div id="mega-menu" class="pointer-events-none absolute inset-x-0 top-full hidden lg:block">
      <div class="border-b border-white/[0.06] bg-ink-900/[0.97] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl transition duration-500 ease-[cubic-bezier(.16,1,.3,1)]" (pointerenter)="openMega()" (pointerleave)="closeMegaSoon()"
           [class]="mega() ? 'pointer-events-auto visible translate-y-0 opacity-100' : 'invisible -translate-y-3 opacity-0'">
        <div class="container-x grid grid-cols-[1fr_18rem] gap-10 py-10">
          <div class="grid grid-cols-3 gap-x-8 gap-y-8">
            @for (g of groups; track g.id; let gi = $index) {
              <div class="transition duration-700" [style.transition-delay.ms]="mega() ? 60 + gi * 40 : 0"
                   [class]="mega() ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'">
                <p class="eyebrow !text-[0.68rem]">{{ 'products.groups.' + g.id | translate }}</p>
                <ul class="mt-3 grid gap-0.5">
                  @for (c of byGroup(g.id); track c.slug) {
                    <li>
                      <a [routerLink]="['/products', c.slug]" (click)="closeAll()"
                         class="group flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-steel-200 transition hover:bg-white/[0.04] hover:text-white">
                        <span class="grid size-8 place-items-center rounded-lg bg-white/[0.04] text-steel-300 transition group-hover:bg-hivis-500 group-hover:text-ink-900">
                          <app-icon [name]="c.icon" class="size-[1.1rem]" />
                        </span>
                        {{ 'products.categories.' + c.slug + '.name' | translate }}
                      </a>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
          <aside class="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-ink-800 p-7">
            <div class="hazard absolute -top-6 -right-16 h-12 w-56 rotate-[30deg] opacity-80" aria-hidden="true"></div>
            <div>
              <p class="eyebrow">{{ 'mega.eyebrow' | translate }}</p>
              <p class="display mt-4 text-2xl text-steel-100">{{ 'mega.title' | translate }}</p>
              <p class="mt-3 text-sm leading-relaxed text-steel-400">{{ 'mega.text' | translate }}</p>
            </div>
            <div class="mt-6 grid gap-2">
              <a routerLink="/products" (click)="closeAll()" class="btn btn-hivis !min-h-11 text-sm">{{ 'mega.all' | translate }}</a>
              <a [href]="company.brochureUrl" target="_blank" rel="noopener" class="btn btn-ghost !min-h-11 text-sm">
                <app-icon name="download" class="size-4" /> {{ 'common.brochure' | translate }}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>

    <!-- ===== Phone menu ===== -->
    <div id="mobile-menu" class="fixed inset-0 top-20 z-40 overflow-y-auto overscroll-contain bg-ink-900 transition duration-500 ease-[cubic-bezier(.16,1,.3,1)] lg:hidden"
         [class]="menu() ? 'visible opacity-100' : 'invisible opacity-0'" [attr.aria-hidden]="!menu()">
      <div class="grid-lines absolute inset-0 opacity-50" aria-hidden="true"></div>
      <nav class="container-x relative flex min-h-full flex-col pt-6 pb-[calc(7rem+env(safe-area-inset-bottom))]" [attr.aria-label]="'nav.main' | translate">
        <ul class="grid">
          @for (item of mobileNav; track item.path; let i = $index) {
            <li class="border-b border-white/[0.07] transition duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
                [style.transition-delay.ms]="menu() ? 80 + i * 60 : 0" [class]="menu() ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'">
              @if (item.path === '/products') {
                <button type="button" (click)="productsOpen.set(!productsOpen())" [attr.aria-expanded]="productsOpen()"
                        class="display flex w-full items-center justify-between py-5 text-left text-4xl text-steel-100">
                  {{ item.label | translate }}
                  <app-icon name="chevronDown" class="size-7 text-hivis-500 transition duration-500" [class.rotate-180]="productsOpen()" />
                </button>
                <div class="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.16,1,.3,1)]" [style.grid-template-rows]="productsOpen() ? '1fr' : '0fr'">
                  <ul class="grid min-h-0 grid-cols-1 gap-1 overflow-hidden min-[420px]:grid-cols-2">
                    @for (c of categories; track c.slug) {
                      <li>
                        <a [routerLink]="['/products', c.slug]" (click)="closeAll()" class="flex items-center gap-3 rounded-xl py-2.5 text-sm text-steel-300 active:bg-white/5">
                          <app-icon [name]="c.icon" class="size-5 text-hivis-500" /> {{ 'products.categories.' + c.slug + '.name' | translate }}
                        </a>
                      </li>
                    }
                    <li class="pb-4 min-[420px]:col-span-2"><a routerLink="/products" (click)="closeAll()" class="btn btn-ghost mt-2 w-full">{{ 'mega.all' | translate }}</a></li>
                  </ul>
                </div>
              } @else {
                <a [routerLink]="item.path" (click)="closeAll()" routerLinkActive="!text-hivis-500"
                   class="display flex items-center justify-between py-5 text-4xl text-steel-100">
                  {{ item.label | translate }} <app-icon name="arrowUpRight" class="size-7 text-steel-400" />
                </a>
              }
            </li>
          }
        </ul>
        <div class="mt-auto grid gap-6 pt-10">
          <app-lang-switch [inline]="true" />
          <div class="grid gap-2 text-sm text-steel-400">
            @for (p of company.phones; track p.href) {
              <a [href]="p.href" class="flex min-h-11 items-center gap-3 text-steel-200"><app-icon name="phone" class="size-4 text-hivis-500" /> {{ p.label }}</a>
            }
            <a [href]="'mailto:' + company.emails.info" class="flex min-h-11 items-center gap-3 break-all text-steel-200"><app-icon name="mail" class="size-4 text-hivis-500" /> {{ company.emails.info }}</a>
          </div>
        </div>
      </nav>
    </div>
  `,
})
export class Header {
  protected readonly nav = NAV;
  protected readonly mobileNav = [{ path: '/', label: 'nav.home' }, ...NAV];
  protected readonly company = COMPANY;
  protected readonly quote = inject(QuoteService);
  protected readonly groups = PRODUCT_GROUPS;
  protected readonly categories = PRODUCT_CATEGORIES;

  protected readonly solid = signal(false);
  protected readonly hidden = signal(false);
  protected readonly menu = signal(false);
  protected readonly mega = signal(false);
  protected readonly productsOpen = signal(false);

  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly document = inject(DOCUMENT);
  private lastY = 0;
  private megaTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationStart), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => this.closeAll());

    // Lock page scroll behind the phone menu.
    effect(() => {
      if (!this.browser) return;
      this.document.documentElement.style.overflow = this.menu() ? 'hidden' : '';
    });
  }

  protected byGroup(id: string) {
    return this.categories.filter((c) => c.group === id);
  }

  protected onScroll(): void {
    const y = window.scrollY;
    this.solid.set(y > 30);
    // Hide only after a real downward move, and never near the top.
    if (Math.abs(y - this.lastY) > 6) {
      this.hidden.set(y > this.lastY && y > 280);
      this.lastY = y;
    }
  }

  protected openMega(): void {
    clearTimeout(this.megaTimer);
    this.mega.set(true);
  }

  protected closeMegaSoon(): void {
    clearTimeout(this.megaTimer);
    this.megaTimer = setTimeout(() => this.mega.set(false), 180);
  }

  protected closeAll(): void {
    clearTimeout(this.megaTimer);
    this.mega.set(false);
    this.menu.set(false);
  }
}
