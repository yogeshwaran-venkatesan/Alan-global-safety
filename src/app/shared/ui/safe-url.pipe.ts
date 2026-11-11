import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/** Marks a URL we build ourselves (Google Maps embed) as safe for an iframe. */
@Pipe({ name: 'safeUrl' })
export class SafeUrlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);
  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
