import { Routes } from '@angular/router';

/** Every page is lazy-loaded and prerendered. More pages arrive in later batches. */
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage) },
  { path: 'products', loadComponent: () => import('./features/products/products.page').then((m) => m.ProductsPage) },
  { path: 'products/:slug/:item', loadComponent: () => import('./features/products/product.page').then((m) => m.ProductPage) },
  { path: 'products/:slug', loadComponent: () => import('./features/products/category.page').then((m) => m.CategoryPage) },
  { path: 'trainings', loadComponent: () => import('./features/trainings/trainings.page').then((m) => m.TrainingsPage) },
  { path: 'trainings/:key', loadComponent: () => import('./features/trainings/training.page').then((m) => m.TrainingPage) },
  { path: 'about', loadComponent: () => import('./features/about/about.page').then((m) => m.AboutPage) },
  { path: 'contact', loadComponent: () => import('./features/contact/contact.page').then((m) => m.ContactPage) },
  { path: 'quote', loadComponent: () => import('./features/quote/quote.page').then((m) => m.QuotePage) },
  /** Prerendered as /404.html for the host to serve on unknown URLs (scripts/postbuild.mjs). */
  { path: '404', loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage) },
  { path: '**', loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage) },
];
