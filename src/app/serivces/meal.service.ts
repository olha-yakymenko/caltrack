import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { Meal } from '../interfaces/meal';
import { HttpClient } from '@angular/common/http';

import { Product } from '../interfaces/product';
import { MealItem } from '../interfaces/meal-item';

@Injectable({
  providedIn: 'root',
})
export class MealService {

  private apiUrl = 'http://localhost:3000';

  // public constructor(private httpClient: HttpClient) {}

  private httpClient = inject(HttpClient);


  public getMeals(): Observable<Meal[]> {
  return this.httpClient.get<Meal[]>('http://localhost:3000/meals');
}



  private mapMealItems(
    meal: Meal,
    products: Product[]
  ): (MealItem & { productName: string; caloriesPer100g: number })[] {
    return meal.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);

      return {
        ...item,
        productName: product?.name ?? 'Unknown',
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

public getMealWithProducts(id: string): Observable<Meal> {
  return this.getMeal(id).pipe(
    map((meal) => ({
      ...meal,
      items: meal.items 
    }))
  );
}


  public addMeal(meal: Meal): Observable<Meal> {
    return this.httpClient.post<Meal>(`${this.apiUrl}/meals`, meal);
  }

  public updateMeal(meal: Meal): Observable<Meal> {
    return this.httpClient.put<Meal>(`${this.apiUrl}/meals/${meal.id}`, meal);
  }

public deleteMeal(id: string): Observable<void> {
  return this.httpClient.delete<void>(`${this.apiUrl}/meals/${id}`);
}
  
  public getProducts(): Observable<Product[]> {
  return this.httpClient.get<Product[]>(`${this.apiUrl}/products`);
  }

}
