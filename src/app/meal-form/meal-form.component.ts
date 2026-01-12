import { Component, signal, OnInit, inject } from '@angular/core';
import { FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MealService } from '../serivces/meal.service';
import { Meal } from '../interfaces/meal';
import { MealItem } from '../interfaces/meal-item';
import { totalGramsValidator } from '../validators/total-grams.validator';
import { Observable } from 'rxjs';
import { Product } from '../interfaces/product';

@Component({
  selector: 'app-meal-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './meal-form.component.html',
  styleUrls: ['./meal-form.component.scss'],
})
export class MealFormComponent implements OnInit {

  public meal: Meal | null = null;
  public step = signal(1);

  private mealService = inject(MealService);
  private route = inject(ActivatedRoute);

  public mealForm = new FormGroup({
  name: new FormControl<string | null>('', {
    validators: [
      (c) => Validators.required(c),
      (c) => Validators.minLength(3)(c),
      (c) => Validators.maxLength(50)(c),
    ],
  }),

  date: new FormControl<string | null>('', {
    validators: [(c) => Validators.required(c)],
  }),

  items: new FormArray(
    [
      new FormGroup({
        productId: new FormControl<string | null>(null, {
          validators: [(c) => Validators.required(c)],
        }),
        productName: new FormControl<string>(''),
        grams: new FormControl<number | null>(0, {
          validators: [
            (c) => Validators.required(c),
            (c) => Validators.min(1)(c),
            (c) => Validators.max(2000)(c),
          ],
        }),
      }),
    ],
    {
      validators: [(c) => totalGramsValidator(c)],
    }
  ),
});

private products: Product[] = [];
public filteredProducts: Product[][] = [];


public ngOnInit(): void {
  this.mealService.getProducts().subscribe((products) => {
  this.products = products;
});


  const id = this.route.snapshot.paramMap.get('id');
  console.log("id", id);
  if (!id) return;

  this.mealService.getMeal(id).subscribe((res) => {
    this.meal = res;

    this.mealForm.patchValue({
      name: res.name,
      date: res.date
    });

    this.items.clear();
    this.filteredProducts = [];


    res.items.forEach((item) => {
      this.filteredProducts.push([]);
      this.items.push(
        new FormGroup({
          productId: new FormControl<string | null>(
            String(item.productId),
            [(c) => Validators.required(c)]
          ),
          productName: new FormControl<string>(
      this.getProductName(String(item.productId)) 
    ),
          grams: new FormControl<number | null>(item.grams, [
            (c) => Validators.required(c),
            (c) => Validators.min(1)(c),
            (c) => Validators.max(2000)(c),
          ]),
        })
      );
    });
  });
};


  public get items(): FormArray {
    return this.mealForm.get('items') as FormArray;
  }

  public getMeal(id: string): Observable<Meal>{
    return this.mealService.getMeal(id);
  }

public edit = (_id: string): void => {
  this.saveMeal();
};

public submit = (): void => {
  this.saveMeal();
};



public saveMeal = (): void => {
  if (this.mealForm.invalid) {
    this.mealForm.markAllAsTouched();
    
return;
  }

  const items = this.mealForm.controls.items.value as MealItem[];

  this.mealService.getProducts().subscribe((products) => {
    const totalCalories = items.reduce((sum, item) => {
      const product = products.find((p) => String(p.id) === String(item.productId));
      if (!product) return sum;
      
return sum + (product.caloriesPer100g * (item.grams || 0)) / 100;
    }, 0);

    const meal: Meal = {
      id: this.meal?.id,
      userId: 1,
      name: this.mealForm.controls.name.value!,
      date: this.mealForm.controls.date.value!,
      items,
      totalCalories: Math.round(totalCalories),
    };

    if (this.meal?.id) {
      this.mealService.updateMeal(meal).subscribe({
        next: (updatedMeal) => {
          console.log('Meal updated:', updatedMeal);
          alert(`Posiłek zaktualizowany (${updatedMeal.totalCalories} kcal)`);
        },
        error: (err) => {
          console.error(err);
          alert('Błąd aktualizacji');
        }
      });
    } else {
      this.mealService.addMeal(meal).subscribe({
        next: (savedMeal) => {
          console.log('Meal saved:', savedMeal);
          alert(`Posiłek zapisany (${savedMeal.totalCalories} kcal)`);
        },
        error: (err) => {
          console.error(err);
          alert('Błąd zapisu');
        }
      });
    }
  });
};


public addItem = (): void => {
  this.filteredProducts.push([]);

  const itemGroup = new FormGroup({
  productId: new FormControl<string | null>(
    null,
    [(c) => Validators.required(c)]
  ),
  productName: new FormControl<string>(''),
  grams: new FormControl<number | null>(null, [
    (c) => Validators.required(c),
    (c) => Validators.min(1)(c),
    (c) => Validators.max(2000)(c),
  ]),
});


  this.items.push(itemGroup);
  this.items.updateValueAndValidity();
};

public next = (): void => {
  this.step.update((value) => value + 1);
};

public back = (): void => {
  this.step.update((value) => value - 1);
};

public removeItem = (index: number): void => {
  if (this.items.length > 1) {
    this.items.removeAt(index);
    this.filteredProducts.splice(index, 1);
  }
};


public onSearch(value: string | null, index: number): void {
  if (!value) {
    this.filteredProducts[index] = [];
    
return;
  }

  this.filteredProducts[index] = this.products.filter((p) =>
    p.name.toLowerCase().includes(value.toLowerCase())
  );
}


public selectProduct(product: Product, index: number): void {

  const group = this.items.at(index) as FormGroup;

  group.patchValue({
    productId: String(product.id),
    productName: product.name
  });

  this.filteredProducts[index] = [];
}

public getProductName(productId: string | null): string {
  const product = this.products.find((p) => String(p.id) === productId);
  
  return product ? product.name : '';
}


}