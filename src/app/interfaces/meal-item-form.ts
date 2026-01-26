import { FormControl } from '@angular/forms';

export interface MealItemForm {
  productId: FormControl<string | null>;
  productName: FormControl<string | null>;
  grams: FormControl<number | null>;
  isCustomProduct: FormControl<boolean | null>;
  customProductCalories: FormControl<number | null>;
}
