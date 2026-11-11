import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { COMPANY } from './company.config';

export type EmailResult = 'sent' | 'skipped' | 'failed';

export interface EnquiryEmail {
  subject: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
}

/** Heading plus "Label: value" lines, skipping empty values. */
export const buildMessage = (heading: string, rows: [string, string | number | null | undefined][]): string =>
  [heading, '', ...rows.filter(([, v]) => v !== '' && v !== null && v !== undefined).map(([l, v]) => `${l}: ${v}`)].join('\n');

/**
 * Sends enquiries without a backend: WhatsApp opens with the message ready, and
 * a copy is emailed through Web3Forms once a key is set in company.config.ts.
 */
@Injectable({ providedIn: 'root' })
export class EnquiryService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  get emailEnabled(): boolean {
    return !COMPANY.web3formsKey.startsWith('YOUR-');
  }

  /** Call synchronously inside the click handler so pop-up blockers allow it. */
  openWhatsApp(url: string): void {
    if (this.browser) window.open(url, '_blank', 'noopener');
  }

  async sendEmail(mail: EnquiryEmail): Promise<EmailResult> {
    if (!this.browser || !this.emailEnabled) return 'skipped';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: COMPANY.web3formsKey,
          from_name: `${COMPANY.name} website`,
          subject: mail.subject,
          name: mail.name,
          phone: mail.phone,
          email: mail.email || undefined,
          message: mail.message,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { success?: boolean };
      return res.ok && body.success !== false ? 'sent' : 'failed';
    } catch {
      return 'failed';
    }
  }
}
