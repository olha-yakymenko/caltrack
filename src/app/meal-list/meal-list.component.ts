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

  currentPage = 1;
  pageSize = 5;
  pageSizeOptions = [5, 10, 20];

  totalPages = 1;
  pagedMeals: Meal[] = [];


  constructor(protected mealService: MealService){}

  ngOnInit(){
    console.log("tutaj")
    this.mealService.getMeals().subscribe((res) =>{
      this.meals = res;
      this.filteredMeals = res;
      this.applyPagination(); 
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

private applyPagination(): void {
  this.totalPages = Math.ceil(this.filteredMeals.length / this.pageSize);

  const startIndex = (this.currentPage - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;

  this.pagedMeals = this.filteredMeals.slice(startIndex, endIndex);
}


  public sortMealsDecs(): void {
  this.meals = [...this.meals].sort((a, b) =>
    b.name.localeCompare(a.name)
  );
  this.applyPagination();

}

public sortDateAsc(): void {
  this.meals = [...this.meals].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  this.applyPagination();

}

public sortDateDesc(): void {
  this.meals = [...this.meals].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  this.applyPagination();

}

public sortCaloriesAsc(): void {
  this.meals = [...this.meals].sort(
    (a, b) => (a.totalCalories ?? 0) - (b.totalCalories ?? 0)
  );
  this.applyPagination();

}


public sortCaloriesDesc(): void {
  this.meals = [...this.meals].sort(
    (a, b) => (b.totalCalories ?? 0) - (a.totalCalories ?? 0)
  );
  this.applyPagination();

}


nameFilter = '';
  caloriesFilter: 'low' | 'medium' | 'high' | '' = '';
  underLimitOnly = false;



onNameFilterChange(event: Event) {
    this.nameFilter = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters();
    this.applyPagination();

  }

  onCaloriesFilterChange(event: Event) {
    this.caloriesFilter = (event.target as HTMLSelectElement).value as any;
    this.applyFilters();
    this.applyPagination();

  }

  onUnderLimitChange(event: Event) {
    this.underLimitOnly = (event.target as HTMLInputElement).checked;
    this.applyFilters();
    this.applyPagination();

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

    this.currentPage = 1; // reset strony po filtrze
    this.applyPagination();

  }


  goToPage(page: number): void {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
  this.applyPagination();
}

changePageSize(event: Event): void {
  this.pageSize = Number((event.target as HTMLSelectElement).value);
  this.currentPage = 1;
  this.applyPagination();
}

}
