import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Inline stroke icon set (24×24), drawn for this project in a consistent
 * 1.6px industrial line style. Includes one pictogram per product category.
 */
const PATHS: Record<string, string> = {
  // ---- Interface
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  arrowUpRight: 'M7 17 17 7M8 7h9v9',
  chevronDown: 'm6 9 6 6 6-6',
  menu: 'M4 7h16M4 12h16M4 17h10',
  close: 'M6 6l12 12M18 6 6 18',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z',
  mail: 'M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm18 2-10 6L2 7',
  pin: 'M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  download: 'M12 3v12m-5-5 5 5 5-5M5 21h14',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2c2.5 3 3.5 6.5 3.5 10S14.5 19 12 22c-2.5-3-3.5-6.5-3.5-10S9.5 5 12 2Z',
  check: 'm5 12 5 5 9-10',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  arrowLeft: 'M19 12H5m6 6-6-6 6-6',
  filter: 'M3 5h18l-7 8v6l-4 2v-8Z',
  quote: 'M9 5H5v6h4v-1c0 2-1 4-4 5M19 5h-4v6h4v-1c0 2-1 4-4 5',
  shield: 'M12 2 20 5v7c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V5Zm-3.5 10 2.5 2.5 5-5',
  clipboard: 'M9 3h6v3H9ZM7 5H5v16h14V5h-2M9 11h6M9 15h4',
  truck: 'M2 6h11v10H2ZM13 9h4l4 4v3h-8M6.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8ZM19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8Z',
  whatsapp: 'M3 21l1.7-5A8.5 8.5 0 1 1 8 19.3ZM9 8.5c0 3 3.5 6.5 6.5 6.5l1-1.5-2-1-1 1c-1-.4-2.6-2-3-3l1-1-1-2Z',

  // ---- Training topics
  flame: 'M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8a7 7 0 0 0 7 7Zm0-3a3 3 0 0 0 3-3c0-2-2-3-3-5-1 2-3 3-3 5a3 3 0 0 0 3 3Z',
  heartPulse: 'M19.5 13.5 12 21l-7.5-7.5A5 5 0 0 1 12 6.5a5 5 0 0 1 7.5 7ZM3 12h4l2-3 3 6 2-3h7',
  exit: 'M10 3H5v18h5M15 8l4 4-4 4M19 12H9',
  siren: 'M7 18v-6a5 5 0 0 1 10 0v6M5 21h14v-3H5ZM12 2v2M4.2 5.2l1.4 1.4M19.8 5.2l-1.4 1.4M2 12h2M20 12h2',
  hydrant: 'M8 21h8M9 21V9h6v12M7 9h10M10 9V6a2 2 0 0 1 4 0v3M6 13h3M15 13h3',

  brain: 'M9.5 3a3 3 0 0 0-3 3v.2A3 3 0 0 0 4 9.5a3 3 0 0 0 .7 1.9A3.5 3.5 0 0 0 6.5 18a3 3 0 0 0 5.5 1.5V5a2 2 0 0 0-2.5-2ZM14.5 3a3 3 0 0 1 3 3v.2a3 3 0 0 1 2.5 3.3 3 3 0 0 1-.7 1.9 3.5 3.5 0 0 1-1.8 6.6A3 3 0 0 1 12 19.5V5a2 2 0 0 1 2.5-2Z',
  car: 'M5 17h14M5 17v2M19 17v2M3 13l2-5.5A2 2 0 0 1 6.9 6h10.2a2 2 0 0 1 1.9 1.5L21 13v4H3ZM3 13h18M7 15h.01M17 15h.01',
  flask: 'M9 3h6M10 3v6l-5.5 9.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7.5 15h9',
  home: 'M3 11l9-7 9 7M5 9.5V21h14V9.5M10 21v-6h4v6',
  weld: 'M4 20l7-7M9 11l4 4M13 15l3-3-4-4-3 3M17 3l1 3M21 7l-3 1M20 3l-2 2M14 4l1 1',
  manhole: 'M12 3a9 4 0 1 0 0 .01ZM3 7v4c0 2.2 4 4 9 4s9-1.8 9-4V7M8 15v6M16 15v6M8 18h8',
  recycle: 'M7 19H4.8a1.8 1.8 0 0 1-1.6-2.7L5.4 12.5M11 19h8.2a1.8 1.8 0 0 0 1.6-2.7l-1.3-2.2M14 16l-3 3 3 3M8.3 13.6 7 8.6l-5 1.3M9.3 5.2l1.1-1.9a1.8 1.8 0 0 1 3.1 0l4.1 7.1M13.4 9.6l4.6 1.2 1.2-4.6',
  grid5: 'M4 4h6v6H4ZM14 4h6v6h-6ZM4 14h6v6H4ZM14 14h6v6h-6Z',
  alert: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01',
  box: 'M21 8 12 3 3 8v8l9 5 9-5ZM3 8l9 5 9-5M12 13v8',
  forklift: 'M3 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM13 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM7 19h6M3 17V9h7l3 5v5M17 19h4M19 4v15M10 9V5H5v4',

  // ---- Product categories
  helmet: 'M3 17.5h18M4.5 17.5V15a7.5 7.5 0 0 1 15 0v2.5M10 7.8V12M14 7.8V12M9 20h6',
  goggles: 'M2 10.5A2.5 2.5 0 0 1 4.5 8h15a2.5 2.5 0 0 1 2.5 2.5V13a3 3 0 0 1-3 3h-3.5L12 13.5 8.5 16H5a3 3 0 0 1-3-3ZM6 11.5h3M15 11.5h3',
  earmuff: 'M5 14v-3a7 7 0 0 1 14 0v3M3.5 13H7v6.5H3.5a1 1 0 0 1-1-1V14a1 1 0 0 1 1-1ZM17 13h3.5a1 1 0 0 1 1 1v4.5a1 1 0 0 1-1 1H17Z',
  mask: 'M4 9.5C7 7.5 17 7.5 20 9.5v2.5a8 8 0 0 1-16 0ZM9 13.5h6M2 8l2 1.5M22 8l-2 1.5M12 9v8',
  airline: 'M7 3h10a3 3 0 0 1 3 3v5a8 8 0 0 1-16 0V6a3 3 0 0 1 3-3ZM8 9h8v3a4 4 0 0 1-8 0ZM12 19v3M9 22h6',
  glove: 'M7 21h9l1.5-6 2.5-4.5a1.6 1.6 0 0 0-2.8-1.6L15.5 11V4.5a1.5 1.5 0 0 0-3 0V10M12.5 10V3.5a1.5 1.5 0 0 0-3 0V10M9.5 10V5.5a1.5 1.5 0 0 0-3 0V14l-.8-1.6a1.5 1.5 0 0 0-2.6 1.5L7 21',
  vest: 'M8.5 3 4 5.5V21h6v-6h4v6h6V5.5L15.5 3 14 7h-4ZM4 12h6M14 12h6M4 16h6M14 16h6',
  boot: 'M6 3h6.5v8.5l6 2A3 3 0 0 1 21 16.4V19H3V4a1 1 0 0 1 1-1ZM3 16h18M6.5 7h6',
  harness: 'M12 2.5a2 2 0 1 0 0 .01M8 7h8l-1 6 2 8.5M9 13l-2 8.5M9 13h6M10 7l2 6 2-6M12 2.5v2',
  ladder: 'M7 2v20M17 2v20M7 6h10M7 10.5h10M7 15h10M7 19.5h10',
  firstAid: 'M4 7h16v13H4ZM9 7V4h6v3M12 10.5v6M9 13.5h6',
  eyewash: 'M12 3v4M7 7h10l-1.2 4H8.2ZM12 11v2M8 18a4 4 0 0 0 8 0ZM5 21h14',
  tripod: 'M12 3 4.5 21M12 3l7.5 18M12 3v18M10 3h4M12 12v4.5M10.5 16.5h3',
  sorbent: 'M12 2.5s5.5 6.2 5.5 9.5a5.5 5.5 0 0 1-11 0c0-3.3 5.5-9.5 5.5-9.5ZM3 21h18M5 18.5h14M10 13a2 2 0 0 0 2 2',
  cabinet: 'M5 3h14v18H5ZM12 3v18M9.5 10.5v3M14.5 10.5v3M7 6.5h3M14 6.5h3',
  detector: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM9 5.5h6v5H9ZM10 14.5h.01M14 14.5h.01M10 18h4M10.5 8.5 12 7l1.5 1.5',
  cone: 'M10 3h4l5 16H5ZM8.1 9.5h7.8M6.8 14h10.4M3 21h18',
  flashlight: 'M8 3h8v4l-2 3v11h-4V10L8 7ZM8 7h8M12 13v2',
  sign: 'M4 4h16v11H4ZM12 15v6M8 21h8M9 9.5h6M13 7.5l2 2-2 2',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7Z',
  lockout: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5ZM12 15v3M12 15a1 1 0 1 0 0-.01',
};

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block shrink-0', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" [attr.stroke-width]="stroke()" stroke-linecap="round" stroke-linejoin="round" class="size-full">
      <path [attr.d]="d()" />
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<string>();
  readonly stroke = input(1.6);
  protected readonly d = computed(() => PATHS[this.name()] ?? '');
}

export const ICON_NAMES = Object.keys(PATHS);
