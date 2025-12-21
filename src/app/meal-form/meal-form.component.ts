import { Component, signal } from '@angular/core';
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

@Component({
  selector: 'app-meal-form',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './meal-form.component.html',
  styleUrl: './meal-form.component.scss',
})
export class MealFormComponent {

  meal: Meal | null = null;

  constructor(private mealService: MealService, private route: ActivatedRoute){}

  mealForm = new FormGroup(
  {
    name: new FormControl<string | null>('', {
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ],
    }),

    date: new FormControl<string | null>('', {
      validators: [Validators.required],
    }),

    items: new FormArray(
      [
        new FormGroup({
          productId: new FormControl<number | null>(null, {
            validators: [Validators.required],
          }),
          grams: new FormControl<number | null>(0, {
            validators: [
              Validators.required,
              Validators.min(1),
              Validators.max(2000),
            ],
          }),
        }),
      ],
      {
        validators: [totalGramsValidator], 
      }
    ),
  },
  // {
  //   updateOn: 'change',
  // }
);

  ngOnInit(){
    const id = this.route.snapshot.paramMap.get('id') as string;
    console.log("ID z URL:", id);
    if (id!=null){
        this.mealService.getMeal(id).subscribe(res => {
        this.meal = res; 

        this.mealForm.get('name')?.setValue(res.name ?? ''); 
        this.mealForm.get('date')?.setValue(res.date ?? ''); 
        this.mealForm.get('items')?.setValue(res.items ?? []); 

      });
    }
  }
  
  

  getMeal(id: string){
    return this.mealService.getMeal(id)
  }

  edit(id: string) {
  const meal: Meal = {
    id,
    userId: 1, 
    name: this.mealForm.controls.name.value!,
    date: this.mealForm.controls.date.value!,
    items: this.mealForm.controls.items.value as MealItem[],
  };

  this.mealService.updateMeal(meal);
}



  submit() {
  const meal: Meal = {
    userId: 1,
    name: this.mealForm.controls.name.value!,
    date: this.mealForm.controls.date.value!,
    items: this.mealForm.controls.items.value as MealItem[],
  };

  this.mealService.addMeal(meal).subscribe({
    next: (savedMeal) => {
      console.log("Meal saved:", savedMeal);
      alert(`Meal saved with ID: ${savedMeal.id}`);
    },
    error: (err) => {
      console.error("Error saving meal:", err);
      alert("Failed to save meal. Check console.");
    },
  });
}


saveMeal() {
  const meal: Meal = {
    id: this.meal?.id,       
    userId: 1,
    name: this.mealForm.controls.name.value!,
    date: this.mealForm.controls.date.value!,
    items: this.mealForm.controls.items.value as MealItem[],
  };
  // console.log('ITEMS ERRORS:', this.mealForm.items.errors);
console.log('FORM ERRORS:', this.mealForm.valid);


  if (this.meal?.id) {
    this.mealService.updateMeal(meal).subscribe({
      next: (updatedMeal) => {
        console.log("Meal updated:", updatedMeal);
        alert(`Meal updated with ID: ${updatedMeal.id}`);
      },
      error: (err) => {
        console.error("Error updating meal:", err);
        alert("Failed to update meal. Check console.");
      }
    });
  } else {
    this.mealService.addMeal(meal).subscribe({
      next: (savedMeal) => {
        console.log("Meal saved:", savedMeal);
        alert(`Meal saved with ID: ${savedMeal.id}`);
      },
      error: (err) => {
        console.error("Error saving meal:", err);
        alert("Failed to save meal. Check console.");
      }
    });
  }
}


addItem() {
  const itemGroup = new FormGroup({
    productId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    grams: new FormControl<number | null>(null, {
      validators: [
        Validators.required,
        Validators.min(1),
        Validators.max(2000),
      ],
    }),
  });

  this.items.push(itemGroup);
  this.items.updateValueAndValidity();
}



  step = signal(1);

  next() {
    this.step.update(value => value + 1);
  }

  back() {
    this.step.update(value => value - 1);
  }

  get items(): FormArray {
  return this.mealForm.get('items') as FormArray;
}

removeItem(index: number) {
  if (this.items.length > 1) {
    this.items.removeAt(index);
  }
}

}