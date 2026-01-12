import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap, tap } from 'rxjs';
import { Meal } from '../interfaces/meal';
import { HttpClient } from '@angular/common/http';
import { Product } from '../interfaces/product';
import { MealItem } from '../interfaces/meal-item';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class MealService {
  private apiUrl = 'http://localhost:3000';
  private httpClient = inject(HttpClient);
  private notificationService = inject(NotificationService);

  public getMeals(): Observable<Meal[]> {
    return this.httpClient.get<Meal[]>(`${this.apiUrl}/meals`);
  }

  private mapMealItems(
    meal: Meal,
    products: Product[]
  ): (MealItem & { productName: string; caloriesPer100g: number })[] {
    return meal.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);

      return {
        ...item,
        productName: product?.name ?? 'Nieznany produkt',
        caloriesPer100g: product?.caloriesPer100g ?? 0,
      };
    });
  }

  public getMeal(id: string): Observable<Meal> {
    return this.httpClient.get<Meal>(`${this.apiUrl}/meals/${id}`).pipe(
      switchMap((meal) =>
        this.httpClient.get<Product[]>(`${this.apiUrl}/products`).pipe(
          map((products) => ({
            ...meal,
            items: this.mapMealItems(meal, products)
          }))
        )
      )
    );
  }

  public addMeal(meal: Meal): Observable<Meal> {
    return this.httpClient.post<Meal>(`${this.apiUrl}/meals`, meal).pipe(
      tap((savedMeal) => {
        this.notificationService.success(
          `Posiłek "${savedMeal.name}" został dodany (${savedMeal.totalCalories} kcal)`
        );
      })
    );
  }

  public updateMeal(meal: Meal): Observable<Meal> {
    return this.httpClient.put<Meal>(`${this.apiUrl}/meals/${meal.id}`, meal).pipe(
      tap((updatedMeal) => {
        this.notificationService.success(
          `Posiłek "${updatedMeal.name}" został zaktualizowany (${updatedMeal.totalCalories} kcal)`
        );
      })
    );
  }

  public deleteMeal(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/meals/${id}`).pipe(
      tap(() => {
        this.notificationService.success('Posiłek został usunięty pomyślnie');
      })
    );
  }
  
  public getProducts(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(`${this.apiUrl}/products`);
  }
}