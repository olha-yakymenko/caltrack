import { AbstractControl, ValidationErrors } from '@angular/forms';

export function totalGramsValidator(control: AbstractControl): ValidationErrors | null {
  const items = control.value as { grams: number }[];
  const total = items.reduce((acc, i) => acc + (i.grams || 0), 0);
  return total > 0 ? null : { totalGramsInvalid: true };
}