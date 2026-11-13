import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, switchMap, timer } from 'rxjs';

/**
 * Preloads the other pages' code a few seconds after the page has settled, instead of
 * straight away — so the first visit stays fast on phones and later clicks are still instant.
 */
@Injectable({ providedIn: 'root' })
export class IdlePreload implements PreloadingStrategy {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  preload(_route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (!this.browser) return of(null);
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return of(null);
    return timer(4000).pipe(switchMap(() => load()));
  }
}
