import { FormControl } from '@angular/forms';
import { phoneValidator } from './validators';

const check = (v: string) => phoneValidator(new FormControl(v));

describe('phoneValidator', () => {
  it('accepts Indian and international numbers with spaces or dashes', () => {
    for (const ok of ['9876543210', '+91 98765 43210', '+91-87142-67507', '0484 2345678', '']) expect(check(ok)).withContext(ok).toBeNull();
  });

  it('rejects letters, too few or too many digits', () => {
    for (const bad of ['98765', '+91 98765 43210 12345', 'call me', '98765abc10']) expect(check(bad)).withContext(bad).toEqual({ phone: true });
  });
});
