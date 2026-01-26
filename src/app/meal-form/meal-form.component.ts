import { Component, signal, OnInit, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MealService } from '../serivces/meal.service';
import { Meal } from '../interfaces/meal';
import { MealItem } from '../interfaces/meal-item';
import { totalGramsValidator } from '../validators/total-grams.validator';
import { Observable } from 'rxjs';
import { Product } from '../interfaces/product';
import { AuthService } from '../serivces/auth.service';
import { NotificationService } from '../serivces/notification.service';
import { CommonModule } from '@angular/common';
import { DisabledIfInactiveDirective } from '../directives/disabled-if-inactive.directive';
import { MealForm } from '../interfaces/meal-form';
import { MealItemForm } from '../interfaces/meal-item-form';

@Component({
  selector: 'app-meal-form',
  imports: [ReactiveFormsModule, RouterModule, CommonModule, FormsModule, DisabledIfInactiveDirective],
  templateUrl: './meal-form.component.html',
  styleUrls: ['./meal-form.component.scss'],
})
export class MealFormComponent implements OnInit {
  public meal: Meal | null = null;
  public step = signal(1);
  private currentUserId = '';
  
  public showAddProductModal = false;
  public modalData: {
    productName: string;
    caloriesPer100g: number | null;
    index: number;
  } = {
    productName: '',
    caloriesPer100g: null,
    index: -1
  };

  private mealService = inject(MealService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

public mealForm = new FormGroup<MealForm>({
  name: new FormControl<string>('', {
    validators: [
        (c) => Validators.required(c),
        (c) => Validators.minLength(3)(c),
        (c) => Validators.maxLength(50)(c),
    ],
  }),

  date: new FormControl<string>('', {
    validators: [(c) => Validators.required(c)],
  }),

  items: new FormArray<FormGroup<MealItemForm>>(
    [
      new FormGroup<MealItemForm>({
        productId: new FormControl<string>('', {
          validators: [(c) => Validators.required(c)],
        }),
        productName: new FormControl<string>(''),
        grams: new FormControl<number>(0, {
          validators: [
              (c) => Validators.required(c),
              (c) => Validators.min(1)(c),
              (c) => Validators.max(2000)(c),
          ],
        }),
        isCustomProduct: new FormControl<boolean>(false),
        customProductCalories: new FormControl<number>(0),
      }),
    ],
    {
      validators: [totalGramsValidator],
    }
  ),
});

  private products: Product[] = [];
  public filteredProducts: Product[][] = [];

  public ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserId = currentUser.id;
    } else {
      this.notificationService.error('Nie jesteś zalogowany!');
      
return;
    }

    this.loadProducts();

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.mealService.getMeal(id).subscribe({
      next: (res) => {
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
            new FormGroup<MealItemForm>({
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
                isCustomProduct: new FormControl<boolean>(false),
                customProductCalories: new FormControl<number | null>(null),
              })

          );
        });
      },
      error: (err) => {
        console.error('Error loading meal:', err);
        this.notificationService.error('Błąd podczas ładowania posiłku');
      }
    });
  }

  private loadProducts(): void {
    this.mealService.getProducts().subscribe((products) => {
      this.products = products;
    });
  }

  public get items(): FormArray<FormGroup<MealItemForm>> {
    return this.mealForm.get('items') as FormArray;
  }

  public getMeal(id: string): Observable<Meal> {
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
      this.notificationService.warning('Proszę wypełnić wszystkie wymagane pola poprawnie');
      
return;
    }

    if (!this.currentUserId) {
      this.notificationService.error('Musisz być zalogowany, aby zapisać posiłek!');
      
return;
    }

    const items = this.mealForm.controls.items.value as MealItem[];
    if (items.length === 0) {
      this.notificationService.error('Brak składników w posiłku');
      
return;
    }


    this.mealService.getProducts().subscribe((products) => {
      const totalCalories = items.reduce(
      (sum, item, index) =>
        sum + this.calculateItemCalories(item, index, products),
      0
    );


      const meal: Meal = {
        id: this.meal?.id,
        userId: this.currentUserId,
        name: this.mealForm.controls.name.value!,
        date: this.mealForm.controls.date.value!,
        items,
        totalCalories: Math.round(totalCalories),
      };

      if (this.meal?.id) {
        this.mealService.updateMeal(meal).subscribe({
          next: () => {
            this.notificationService.success('Posiłek został zaktualizowany!');
          },
          error: (err) => {
            this.notificationService.error('Błąd podczas aktualizacji posiłku');
            console.error('Error updating meal:', err);
          }
        });
      } else {
        this.mealService.addMeal(meal).subscribe({
          next: () => {
            this.notificationService.success('Posiłek został zapisany!');
            this.mealForm.reset();
            this.items.clear();
            this.addItem();
            // this.router.navigate(['/meal/list']);
            void this.router.navigate(['/meal/list']);

          },
          error: () => {
            this.notificationService.error('Błąd podczas zapisywania posiłku');
          }
        });
      }
    });
  };


  private calculateItemCalories(
    item: MealItem,
    index: number,
    products: Product[]
  ): number {
    const group = this.items.at(index) as FormGroup;

    const grams = item.grams;
    if (!grams || grams <= 0) {
      return 0;
    }

    const isCustom = group.get('isCustomProduct')?.value === true;

    if (isCustom) {
      const customCaloriesControl = group.get('customProductCalories');
      const customCalories =
        typeof customCaloriesControl?.value === 'number'
          ? customCaloriesControl.value
          : 0;

      return (customCalories * grams) / 100;
    }

    const product = products.find(
      (p) => String(p.id) === String(item.productId)
    );

    if (!product) {
      return 0;
    }

    return (product.caloriesPer100g * grams) / 100;
  }



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
      isCustomProduct: new FormControl<boolean>(false),
      customProductCalories: new FormControl<number | null>(null),
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
      this.notificationService.info('Produkt został usunięty z posiłku');
    }
  };

  public onSearch = (value: string | null, index: number): void => {
    if (!value) {
      this.filteredProducts[index] = [];
      
return;
    }
    
    const trimmedValue = value.trim();
    if (trimmedValue === '') {
      this.filteredProducts[index] = [];
      
return;
    }
    
    const searchTerm = trimmedValue.toLowerCase();
    this.filteredProducts[index] = this.products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm)
    );
    
    const exactMatch = this.products.find(
      (p) => p.name.toLowerCase() === searchTerm
    );

    if (exactMatch && this.filteredProducts[index].length === 0) {
      this.filteredProducts[index] = [exactMatch];
    }
  };

  public selectProduct = (product: Product, index: number): void => {
    const group = this.items.at(index) as FormGroup;
    group.patchValue({
      productId: String(product.id),
      productName: product.name,
      isCustomProduct: product.userId === this.currentUserId,
      customProductCalories: product.userId === this.currentUserId ? product.caloriesPer100g : null
    });
    this.filteredProducts[index] = [];
  };

  public getProductName = (productId: string | null): string => {
    if (!productId) {
      return '';
    }
    
    const product = this.products.find((p) => String(p.id) === productId);
    
return product ? product.name : '';
  };

  public openAddProductModal = (index: number): void => {
    const productNameControl = this.items.at(index).get('productName');

    const productName =
      typeof productNameControl?.value === 'string'
        ? productNameControl.value
        : '';

    if (typeof productName !== 'string' || productName.trim() === '') {
      this.notificationService.warning('Wpisz nazwę produktu przed dodaniem');
      
return;
    }

    if (!productName || productName.trim() === '') {
      this.notificationService.warning('Wpisz nazwę produktu przed dodaniem');
      
return;
    }

    this.modalData = {
      productName: productName.trim(),
      caloriesPer100g: null,
      index: index
    };
    this.showAddProductModal = true;
  };

  public closeAddProductModal = (): void => {
    this.showAddProductModal = false;
    this.modalData = {
      productName: '',
      caloriesPer100g: null,
      index: -1
    };
  };

  public saveCustomProduct = (): void => {
    if (!this.modalData.caloriesPer100g || this.modalData.caloriesPer100g <= 0) {
      this.notificationService.warning('Podaj prawidłową liczbę kalorii');
      
return;
    }

    if (!this.currentUserId) {
      this.notificationService.error('Musisz być zalogowany, aby dodać produkt!');
      
return;
    }

    const newProduct: Partial<Product> = {
      name: this.modalData.productName,
      caloriesPer100g: this.modalData.caloriesPer100g,
      userId: this.currentUserId
    };

    this.mealService.addProduct(newProduct).subscribe({
      next: (product) => {
        this.products.push(product);
        
        const group = this.items.at(this.modalData.index) as FormGroup;
        group.patchValue({
          productId: String(product.id),
          productName: product.name,
          isCustomProduct: true,
          customProductCalories: this.modalData.caloriesPer100g
        });
        
        this.closeAddProductModal();
        this.notificationService.success('Produkt został dodany!');
      },
      error: (err) => {
        this.notificationService.error('Błąd podczas dodawania produktu');
        console.error('Error adding product:', err);
      }
    });
  };

  public hasExactMatchInProducts = (productName: string): boolean => {
    if (!productName || productName.trim() === '') {
      return false;
    }
    
    const searchTerm = productName.toLowerCase().trim();
    
return this.products.some((p) => p.name.toLowerCase() === searchTerm);
  };
}