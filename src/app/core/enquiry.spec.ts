import { buildMessage } from './enquiry';
import { whatsappUrl } from './company.config';

describe('buildMessage', () => {
  it('writes a heading and "Label: value" lines, skipping empty values', () => {
    const msg = buildMessage('New enquiry', [
      ['Name', 'Asha'],
      ['Company', ''],
      ['Phone', '+91 98765 43210'],
      ['Email', undefined],
      ['Qty', 0],
    ]);
    expect(msg).toBe('New enquiry\n\nName: Asha\nPhone: +91 98765 43210\nQty: 0');
  });

  it('builds a WhatsApp link to the company number with the text encoded', () => {
    const url = whatsappUrl('Hi & bye');
    expect(url).toBe('https://wa.me/918714267507?text=Hi%20%26%20bye');
  });
});
