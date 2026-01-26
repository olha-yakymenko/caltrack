import { FormControl } from '@angular/forms';

export interface RegisterFormModel {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  agreeToTerms: FormControl<boolean>;
}
