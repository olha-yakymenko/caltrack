import {
  AbstractControl,
  ValidationErrors,
  FormArray,
  FormGroup,
} from '@angular/forms';

export function totalGramsValidator(
  control: AbstractControl
): ValidationErrors | null {
  if (!(control instanceof FormArray)) {
    return null;
  }

  const result = control.controls.reduce(
    (acc, ctrl) => {
      if (!(ctrl instanceof FormGroup)) {
        return acc;
      }

      const gramsCtrl = ctrl.get('grams');
      if (!gramsCtrl) {
        return acc;
      }

      acc.touched ||= gramsCtrl.touched;

      const value = gramsCtrl.value as number | string | null;
      const grams = Number(value);

      if (!Number.isNaN(grams)) {
        acc.total += grams;
      }

      return acc;
    },
    { total: 0, touched: false }
  );

  if (!result.touched || result.total > 0) {
    return null;
  }

  return { totalGramsInvalid: true };
}
