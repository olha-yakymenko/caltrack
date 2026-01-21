import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Meal } from '../interfaces/meal';
import { MealService } from '../serivces/meal.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DisabledIfInactiveDirective } from '../directives/disabled-if-inactive.directive';
import { Product } from '../interfaces/product';
import { NotificationService } from '../serivces/notification.service';
import { AuthService } from '../serivces/auth.service';
import { CommonModule } from '@angular/common';

interface ExtendedMeal extends Meal {
  imageUrl?: string;
  hasImage?: boolean;
}

interface DayGroup {
  date: string;
  formattedDate: string;
  totalCalories: number;
  meals: Meal[];
  expanded: boolean;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | '';

@Component({
  selector: 'app-meal-list',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, DisabledIfInactiveDirective],
  templateUrl: './meal-list.component.html',
  styleUrl: './meal-list.component.scss',
})
export class MealListComponent implements OnInit {
  public meals: Meal[] = [];
  public filteredMeals: Meal[] = [];
  public dayGroups: DayGroup[] = [];

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
  public isLoadingProducts = false; 
  public currentUserId: string = '';

  public filterForm = new FormGroup({
    name: new FormControl(''),
    calories: new FormControl(''),
    dateFrom: new FormControl(''),
    dateTo: new FormControl(''),
    mealType: new FormControl(''),
    hasImage: new FormControl(false)
  });

  public availableProducts: Product[] = [];
  
  protected mealService = inject(MealService);
  private notificationService = inject(NotificationService); 
  private authService = inject(AuthService);

  public ngOnInit(): void {    
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserId = currentUser.id;
      console.log('Current user ID for meals:', this.currentUserId);
    } else {
      this.notificationService.error('Musisz być zalogowany, aby zobaczyć posiłki');
      
return;
    }
    
    this.loadProducts();
    this.loadMeals(); 
  }

  private loadProducts(): void {
    this.isLoadingProducts = true;
    this.mealService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.availableProducts = products;
        this.isLoadingProducts = false;
      },
      error: (err) => {
        console.error('Błąd ładowania produktów:', err);
        this.notificationService.error('Nie udało się załadować listy produktów');
        this.isLoadingProducts = false;
      }
    });
  }

  private loadMeals(): void {
    this.mealService.getMeals().subscribe({
      next: (res: Meal[]) => {
        this.meals = res.filter((meal) => meal.userId === this.currentUserId);
        this.filteredMeals = [...this.meals];
        this.groupMealsByDay();
        this.calculateGramsRange();
      },
      error: (err) => {
        console.error('Błąd ładowania posiłków:', err);
        this.notificationService.error('Nie udało się załadować listy posiłków');
      }
    });
    
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

private groupMealsByDay(): void {
  const groupedByDate = this.filteredMeals.reduce((groups, meal) => {
    const date = this.extractDateOnly(meal.date);
    (groups[date] ??= []).push(meal); 
    
  return groups;
  }, {} as Record<string, Meal[] | undefined>); 

  this.dayGroups = Object.keys(groupedByDate)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map((date) => {
      const meals = groupedByDate[date]!; 
      const totalCalories = meals.reduce((sum, meal) => sum + (meal.totalCalories || 0), 0);
      
      return {
        date,
        formattedDate: this.formatDate(date),
        totalCalories,
        meals: meals.sort((a, b) => a.name.localeCompare(b.name)),
        expanded: false
      };
    });

  this.applyPagination();
}

  private extractDateOnly(fullDate: string): string {
    return fullDate.split('T')[0];
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Dzisiaj';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Wczoraj';
    } 
      
return date.toLocaleDateString('pl-PL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    
  }

public toggleDayGroup(dayGroup: DayGroup): void {
    dayGroup.expanded = !dayGroup.expanded;
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
    this.mealService.deleteMeal(id).subscribe({
      next: () => {
        this.applyFilters();
      }
    });
  }

  public sortMealsAsc(): void {
    this.filteredMeals.sort((a, b) => a.name.localeCompare(b.name));
    this.groupMealsByDay();
  }

  public sortMealsDesc(): void {
    this.filteredMeals.sort((a, b) => b.name.localeCompare(a.name));
    this.groupMealsByDay();
  }

  public sortDateAsc(): void {
    this.filteredMeals.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    this.groupMealsByDay();
  }

  public toString(value: unknown): string {
    return String(value);
  }

  public sortDateDesc(): void {
    this.filteredMeals.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    this.groupMealsByDay();
  }

  public sortCaloriesAsc(): void {
    this.filteredMeals.sort(
      (a, b) => (a.totalCalories ?? 0) - (b.totalCalories ?? 0)
    );
    this.groupMealsByDay();
  }

  public sortCaloriesDesc(): void {
    this.filteredMeals.sort(
      (a, b) => (b.totalCalories ?? 0) - (a.totalCalories ?? 0)
    );
    this.groupMealsByDay();
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
    this.groupMealsByDay();
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
    this.totalPages = Math.ceil(this.dayGroups.length / this.pageSize) || 1;
  }

  public goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyPagination();
  }

  public get visibleDayGroups(): DayGroup[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    
    return this.dayGroups.slice(startIndex, endIndex);
  }

  public changePageSize(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.pageSize = Number(value);
    this.currentPage = 1;
    this.applyPagination();
  }
}