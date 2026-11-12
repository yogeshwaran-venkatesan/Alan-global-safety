import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Icon } from './icon';

/**
 * Hero illustration drawn in SVG: a hi-vis hard hat on a technical "scan"
 * stage, with layers marked `data-depth` for pointer parallax (see HomePage).
 */
@Component({
  selector: 'app-hero-art',
  imports: [TranslatePipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block aspect-square w-full select-none', 'aria-hidden': 'true' },
  template: `
    <!-- glow -->
    <div data-depth="0.2" class="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(179,201,43,0.35),rgba(47,143,214,0.12)_45%,transparent_70%)] blur-2xl"></div>

    <!-- rotating scan rings -->
    <svg data-depth="0.35" viewBox="0 0 400 400" class="absolute inset-0 size-full">
      <g class="origin-center animate-spin-slow" style="transform-box: fill-box">
        <circle cx="200" cy="200" r="182" fill="none" stroke="rgba(255,255,255,.10)" stroke-dasharray="2 10" />
        <path d="M200 18a182 182 0 0 1 157 90" fill="none" stroke="#b3c92b" stroke-width="2" stroke-linecap="round" />
      </g>
      <g class="origin-center animate-spin-slow [animation-direction:reverse] [animation-duration:40s]" style="transform-box: fill-box">
        <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(255,255,255,.07)" />
        <path d="M60 255a150 150 0 0 1-5-95" fill="none" stroke="#2f8fd6" stroke-width="2" stroke-linecap="round" />
        <circle cx="350" cy="200" r="4" fill="#b3c92b" />
      </g>
      <!-- crosshair ticks -->
      <g stroke="rgba(255,255,255,.25)" stroke-width="1.5">
        <path d="M200 6v14M200 380v14M6 200h14M380 200h14" />
      </g>
    </svg>

    <!-- hard hat -->
    <svg data-depth="0.6" viewBox="0 0 400 400" class="absolute inset-0 size-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.55)]">
      <defs>
        <linearGradient id="hat" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stop-color="#dbe882" />
          <stop offset="0.45" stop-color="#b3c92b" />
          <stop offset="1" stop-color="#86a012" />
        </linearGradient>
        <linearGradient id="ridge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#93ad18" />
          <stop offset="0.5" stop-color="#cfe060" />
          <stop offset="1" stop-color="#7a9310" />
        </linearGradient>
        <linearGradient id="brim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#8ea916" />
          <stop offset="1" stop-color="#5f7409" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="300" rx="150" ry="18" fill="rgba(0,0,0,.45)" />
      <path d="M78 262C78 165 132 104 200 104s122 61 122 158Z" fill="url(#hat)" />
      <path d="M186 106c4-1 24-1 28 0 6 30 7 102 6 156h-40c-1-54 0-126 6-156Z" fill="url(#ridge)" />
      <path d="M118 150c18-26 44-40 64-44-26 22-44 60-48 104-10-18-14-40-16-60Z" fill="#fff" opacity=".32" />
      <path d="M44 262c40-10 272-10 312 0 6 2 6 16 0 18-50 14-262 14-312 0-6-2-6-16 0-18Z" fill="url(#brim)" />
      <path d="M60 266c60-6 220-6 280 0" stroke="#dbe882" stroke-opacity=".6" stroke-width="2" fill="none" />
      <!-- shield badge -->
      <g transform="translate(232 178)">
        <path d="M18 0 34 6v12c0 11-7 18-16 21C9 36 2 29 2 18V6Z" fill="#0a2139" />
        <path d="M10 20l5 5 10-11" stroke="#b3c92b" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    </svg>

    <!-- floating spec chips -->
    <div data-depth="1" class="absolute top-[12%] left-[2%] animate-float">
      <span class="glass flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 font-mono text-[0.7rem] font-semibold tracking-wider text-steel-100 uppercase shadow-card">
        <app-icon name="shield" class="size-4 text-hivis-500" /> {{ 'home.hero.chips.ppe' | translate }}
      </span>
    </div>
    <div data-depth="1.2" class="absolute right-[0%] bottom-[24%] animate-float [animation-delay:-2s]">
      <span class="glass flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 font-mono text-[0.7rem] font-semibold tracking-wider text-steel-100 uppercase shadow-card">
        <app-icon name="flame" class="size-4 text-signal-500" /> {{ 'home.hero.chips.fire' | translate }}
      </span>
    </div>
    <div data-depth="0.9" class="absolute bottom-[6%] left-[14%] animate-float [animation-delay:-4s]">
      <span class="glass flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 font-mono text-[0.7rem] font-semibold tracking-wider text-steel-100 uppercase shadow-card">
        <app-icon name="heartPulse" class="size-4 text-hivis-500" /> {{ 'home.hero.chips.firstAid' | translate }}
      </span>
    </div>
  `,
})
export class HeroArt {}
