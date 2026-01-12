import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Meal } from '../interfaces/meal';
import { MealService } from '../serivces/meal.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

interface ExtendedMeal extends Meal {
  imageUrl?: string;
  hasImage?: boolean;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | '';

@Component({
  selector: 'app-meal-list',
  imports: [RouterModule, ReactiveFormsModule],
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
  public dateRange = {
    from: '',
    to: ''
  };
  public mealType: MealType = '';
  public selectedProducts: string[] = [];
  public gramsRange = {
    min: 0,
    max: 2000
  };
  public hasImage = false;

  public filterForm = new FormGroup({
    name: new FormControl(''),
    calories: new FormControl(''),
    dateFrom: new FormControl(''),
    dateTo: new FormControl(''),
    mealType: new FormControl(''),
    hasImage: new FormControl(false)
  });

  public availableProducts = [
    { id: '1', name: 'Jabłko' },
    { id: '2', name: 'Kurczak' },
    { id: '3', name: 'Ryż' },
    { id: '4', name: 'Brokuł' },
    { id: '5', name: 'Jajko' }
  ];

  protected mealService = inject(MealService);

  public ngOnInit(): void {
    this.mealService.getMeals().subscribe((res: Meal[]) => {
      this.meals = res;
      this.filteredMeals = [...res];
      this.applyPagination();
      this.calculateGramsRange();
    });
    
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private calculateGramsRange(): void {
    if (this.meals.length === 0) return;
    
    let min = Infinity;
    let max = 0;
    
    this.meals.forEach((meal) => {
      meal.items.forEach((item) => {
        if (item.grams < min) min = item.grams;
        if (item.grams > max) max = item.grams;
      });
    });
    
    this.gramsRange.min = min === Infinity ? 0 : min;
    this.gramsRange.max = max;
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

  public onDateFromChange(event: Event): void {
    this.dateRange.from = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  public onDateToChange(event: Event): void {
    this.dateRange.to = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  public onMealTypeChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.mealType = value as MealType;
    this.applyFilters();
  }

  public onProductSelect(productId: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    
    if (isChecked) {
      this.selectedProducts.push(productId);
    } else {
      this.selectedProducts = this.selectedProducts.filter((id) => id !== productId);
    }
    
    this.applyFilters();
  }

  public onGramsMinChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.gramsRange.min = Number(value);
    this.applyFilters();
  }

  public onGramsMaxChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.gramsRange.max = Number(value);
    this.applyFilters();
  }

  public onHasImageChange(event: Event): void {
    this.hasImage = (event.target as HTMLInputElement).checked;
    this.applyFilters();
  }

  public clearFilters(): void {
    this.nameFilter = '';
    this.caloriesFilter = '';
    this.underLimitOnly = false;
    this.dateRange = { from: '', to: '' };
    this.mealType = '';
    this.selectedProducts = [];
    this.gramsRange = { min: 0, max: 2000 };
    this.hasImage = false;
    this.filterForm.reset();
    this.applyFilters();
  }

  public applyFilters(): void {
    this.filteredMeals = this.meals.filter((meal) => 
      this.passesNameFilter(meal) &&
      this.passesCaloriesFilter(meal) &&
      this.passesDateFilter(meal) &&
      this.passesMealTypeFilter(meal) &&
      this.passesProductsFilter(meal) &&
      this.passesGramsFilter(meal) &&
      this.passesImageFilter(meal)
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

  private passesDateFilter(meal: Meal): boolean {
    if (!this.dateRange.from && !this.dateRange.to) return true;
    
    const mealDate = new Date(meal.date);
    
    if (this.dateRange.from) {
      const fromDate = new Date(this.dateRange.from);
      if (mealDate < fromDate) return false;
    }
    
    if (this.dateRange.to) {
      const toDate = new Date(this.dateRange.to);
      if (mealDate > toDate) return false;
    }
    
    return true;
  }

  private passesMealTypeFilter(meal: Meal): boolean {
    if (!this.mealType) return true;
    
    const mealName = meal.name.toLowerCase();
    const mealTypePatterns: Record<Exclude<MealType, ''>, string[]> = {
      breakfast: ['śniadanie', 'breakfast'],
      lunch: ['obiad', 'lunch'],
      dinner: ['kolacja', 'dinner'],
      snack: ['przekąska', 'snack']
    };
    
    const patterns = mealTypePatterns[this.mealType];
    
return patterns.some((pattern) => mealName.includes(pattern));
  }

  private passesProductsFilter(meal: Meal): boolean {
    if (this.selectedProducts.length === 0) return true;
    
    return meal.items.some((item) => 
      this.selectedProducts.includes(String(item.productId))
    );
  }

  private passesGramsFilter(meal: Meal): boolean {
    return meal.items.some((item) => 
      item.grams >= this.gramsRange.min && 
      item.grams <= this.gramsRange.max
    );
  }

  private passesImageFilter(meal: Meal): boolean {
    if (!this.hasImage) return true;
    
    const extendedMeal = meal as ExtendedMeal;
    
return !!extendedMeal.imageUrl || extendedMeal.hasImage === true;
  }

  public applyPagination(): void {
    this.totalPages = Math.ceil(this.filteredMeals.length / this.pageSize) || 1;
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
    const value = (event.target as HTMLSelectElement).value;
    this.pageSize = Number(value);
    this.currentPage = 1;
    this.applyPagination();
  }
}