import { Component } from '@angular/core';
import { Meal } from '../interfaces/meal';
import { MealService } from '../serivces/meal.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-meal-list',
  imports: [RouterModule],
  templateUrl: './meal-list.component.html',
  styleUrl: './meal-list.component.scss',
})
export class MealListComponent {
  meals: Meal[] =[];
  filteredMeals: Meal[] = [];

  constructor(protected mealService: MealService){}

  ngOnInit(){
    console.log("tutaj")
    this.mealService.getMeals().subscribe((res) =>{
      this.meals = res;
      this.filteredMeals = res;
    });
  }

  deleteMeal(id: string | undefined){
    this.mealService.deleteMeal(id).subscribe({
    next: (savedMeal) => {
      console.log("Meal deleted:", savedMeal);
      alert(`Meal deleted with ID: ${savedMeal.id}`);
    },
    error: (err) => {
      console.error("Error deleting meal:", err);
      alert("Failed to delete meal. Check console.");
    },
  });;
  }

  public sortMealsAsc(): void {
  this.meals = [...this.meals].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}


  public sortMealsDecs(): void {
  this.meals = [...this.meals].sort((a, b) =>
    b.name.localeCompare(a.name)
  );
}

public sortDateAsc(): void {
  this.meals = [...this.meals].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

public sortDateDesc(): void {
  this.meals = [...this.meals].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

public sortCaloriesAsc(): void {
  this.meals = [...this.meals].sort(
    (a, b) => (a.totalCalories ?? 0) - (b.totalCalories ?? 0)
  );
}


public sortCaloriesDesc(): void {
  this.meals = [...this.meals].sort(
    (a, b) => (b.totalCalories ?? 0) - (a.totalCalories ?? 0)
  );
}


nameFilter = '';
  caloriesFilter: 'low' | 'medium' | 'high' | '' = '';
  underLimitOnly = false;



onNameFilterChange(event: Event) {
    this.nameFilter = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters();
  }

  onCaloriesFilterChange(event: Event) {
    this.caloriesFilter = (event.target as HTMLSelectElement).value as any;
    this.applyFilters();
  }

  onUnderLimitChange(event: Event) {
    this.underLimitOnly = (event.target as HTMLInputElement).checked;
    this.applyFilters();
  }

  /* ===== główna logika ===== */

  applyFilters() {
    this.filteredMeals = this.meals.filter(meal => {

      if (
        this.nameFilter &&
        !meal.name.toLowerCase().includes(this.nameFilter)
      ) {
        return false;
      }

      if (this.caloriesFilter) {
        const kcal = meal.totalCalories ?? 0;

        if (this.caloriesFilter === 'low' && kcal > 500) return false;
        if (this.caloriesFilter === 'medium' && (kcal < 501 || kcal > 1000)) return false;
        if (this.caloriesFilter === 'high' && kcal <= 1000) return false;
      }

      // if (this.underLimitOnly && (meal.totalCalories ?? 0) > this.dailyLimit) {
      //   return false;
      // }

      return true;
    });
  }
}
