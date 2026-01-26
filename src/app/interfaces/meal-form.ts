import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MealItemForm } from './meal-item-form';

export interface MealForm {
  name: FormControl<string | null>;
  date: FormControl<string | null>;
  items: FormArray<FormGroup<MealItemForm>>;
}
