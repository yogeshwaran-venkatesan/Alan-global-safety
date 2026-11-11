/** Primary navigation. Labels are i18n keys; "products" opens the mega-menu on desktop. */
export const NAV = [
  { path: '/products', label: 'nav.products', mega: true },
  { path: '/trainings', label: 'nav.trainings' },
  { path: '/about', label: 'nav.about' },
  { path: '/contact', label: 'nav.contact' },
] as const;
