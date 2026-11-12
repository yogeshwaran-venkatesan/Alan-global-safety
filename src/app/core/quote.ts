import { isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

/** One line on the quote list: a whole product category, one typical item, or a training programme. */
export interface QuoteLine {
  /** Stable id: "p:<slug>", "p:<slug>:<itemId>" or "t:<key>". */
  id: string;
  kind: 'category' | 'item' | 'training';
  /** Category slug or training key. */
  ref: string;
  /** Catalogue item id within the category (kind "item"). */
  itemId?: string;
  qty: number;
}

/** v2: catalogue rebuilt from the brochure (items are referenced by id, not index). */
const STORAGE_KEY = 'ags.quote.v2';

export const categoryLineId = (slug: string) => `p:${slug}`;
export const itemLineId = (slug: string, itemId: string) => `p:${slug}:${itemId}`;
export const trainingLineId = (key: string) => `t:${key}`;

/**
 * The visitor's "request a quote" list. Lives in this browser only (localStorage)
 * — it's a convenience while browsing; nothing is sent until the quote form is submitted.
 */
@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly state = signal<QuoteLine[]>(this.load());

  readonly lines = this.state.asReadonly();
  readonly count = computed(() => this.state().length);

  constructor() {
    effect(() => this.save(this.state()));
  }

  has(id: string): boolean {
    return this.state().some((l) => l.id === id);
  }

  add(line: Omit<QuoteLine, 'qty'> & { qty?: number }): void {
    if (this.has(line.id)) return;
    this.state.update((s) => [...s, { qty: 1, ...line }]);
  }

  remove(id: string): void {
    this.state.update((s) => s.filter((l) => l.id !== id));
  }

  /** Adds or removes; returns true when the line is now on the list. */
  toggle(line: Omit<QuoteLine, 'qty'>): boolean {
    if (this.has(line.id)) {
      this.remove(line.id);
      return false;
    }
    this.add(line);
    return true;
  }

  setQty(id: string, qty: number): void {
    const q = Math.max(1, Math.min(9999, Math.round(qty) || 1));
    this.state.update((s) => s.map((l) => (l.id === id ? { ...l, qty: q } : l)));
  }

  clear(): void {
    this.state.set([]);
  }

  private load(): QuoteLine[] {
    if (!this.browser) return [];
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      return Array.isArray(raw) ? raw.filter((l) => l && typeof l.id === 'string' && typeof l.ref === 'string') : [];
    } catch {
      return [];
    }
  }

  private save(lines: QuoteLine[]): void {
    if (!this.browser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage blocked: the list still works for this visit */
    }
  }
}
