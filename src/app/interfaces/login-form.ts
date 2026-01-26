import { FormControl } from '@angular/forms';

export interface LoginFormModel {
  email: FormControl<string>;
  password: FormControl<string>;
}
