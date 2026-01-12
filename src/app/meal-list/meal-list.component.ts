import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Meal } from '../interfaces/meal';
import { MealService } from '../serivces/meal.service';

@Component({
  selector: 'app-meal-list',
  imports: [RouterModule],
  templateUrl: './meal-list.component.html',
  styleUrl: './meal-list.component.scss',
})
export class MealListComponent implements OnInit {
  public meals: Meal[] = [];
  public filteredMeals: Meal[] = [];
  public pagedMeals: Meal[] = [];

  public currentPage = 1;
  public pageSize = 5;
  public pageSizeOptions = [5, 10, 20];
  public totalPages = 1;

  public nameFilter = '';
  public caloriesFilter: 'low' | 'medium' | 'high' | '' = '';
  public underLimitOnly = false;

  protected mealService = inject(MealService);

  public ngOnInit(): void {
    this.mealService.getMeals().subscribe((res: Meal[]) => {
      this.meals = res;
      this.filteredMeals = [...res];
      this.applyPagination();
    });
  }

  public deleteMeal(id?: string): void {
    if (!id) return;

    this.mealService.deleteMeal(id).subscribe();
    this.applyFilters();
  }

  public sortMealsAsc(): void {
    this.filteredMeals.sort((a, b) => a.name.localeCompare(b.name));
    this.applyPagination();
  }

  public sortMealsDesc(): void {
    this.filteredMeals.sort((a, b) => b.name.localeCompare(a.name));
    this.applyPagination();
  }

  public sortDateAsc(): void {
    this.filteredMeals.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    this.applyPagination();
  }

  public sortDateDesc(): void {
    this.filteredMeals.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    this.applyPagination();
  }

  public sortCaloriesAsc(): void {
    this.filteredMeals.sort(
      (a, b) => (a.totalCalories ?? 0) - (b.totalCalories ?? 0)
    );
    this.applyPagination();
  }

  public sortCaloriesDesc(): void {
    this.filteredMeals.sort(
      (a, b) => (b.totalCalories ?? 0) - (a.totalCalories ?? 0)
    );
    this.applyPagination();
  }

  public onNameFilterChange(event: Event): void {
    this.nameFilter = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters();
  }

  public onCaloriesFilterChange(event: Event): void {
    this.caloriesFilter = (event.target as HTMLSelectElement)
      .value as 'low' | 'medium' | 'high' | '';
    this.applyFilters();
  }

  public onUnderLimitChange(event: Event): void {
    this.underLimitOnly = (event.target as HTMLInputElement).checked;
    this.applyFilters();
  }

  public applyFilters(): void {
    this.filteredMeals = this.meals.filter((meal) => 
      this.passesNameFilter(meal) &&
      this.passesCaloriesFilter(meal)
    );

    this.currentPage = 1;
    this.applyPagination();
  }

  private passesNameFilter(meal: Meal): boolean {
    if (!this.nameFilter) return true;
    return meal.name.toLowerCase().includes(this.nameFilter);
  }

  private passesCaloriesFilter(meal: Meal): boolean {
    if (!this.caloriesFilter) return true;
    const kcal = meal.totalCalories ?? 0;

    switch (this.caloriesFilter) {
      case 'low':
        return kcal <= 500;
      case 'medium':
        return kcal > 500 && kcal <= 1000;
      case 'high':
        return kcal > 1000;
      default:
        return true;
    }
  }

  public applyPagination(): void {
    this.totalPages = Math.ceil(this.filteredMeals.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedMeals = this.filteredMeals.slice(startIndex, endIndex);
  }

  public goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyPagination();
  }

  public changePageSize(event: Event): void {
    this.pageSize = Number((event.target as HTMLSelectElement).value);
    this.currentPage = 1;
    this.applyPagination();
  }
}