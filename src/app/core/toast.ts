import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  /** i18n key */
  message: string;
  params?: Record<string, unknown>;
  /** Optional router link shown as an action. */
  link?: { path: string; label: string };
}

/** Small confirmation messages ("Added to your quote"). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly toasts = signal<Toast[]>([]);

  show(toast: Omit<Toast, 'id'>, ms = 3800): void {
    const id = this.nextId++;
    this.toasts.update((t) => [...t.slice(-2), { ...toast, id }]);
    setTimeout(() => this.dismiss(id), ms);
  }

  dismiss(id: number): void {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}
