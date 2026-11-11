import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Indian and international numbers: 10–13 digits, optional +, spaces or dashes. */
export const phoneValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const value = String(c.value ?? '').trim();
  if (!value) return null;
  if (!/^\+?[\d\s-]+$/.test(value)) return { phone: true };
  const digits = value.replace(/\D/g, '').length;
  return digits >= 10 && digits <= 13 ? null : { phone: true };
};
