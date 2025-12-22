import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { Meal } from '../interfaces/meal';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root',
})
export class MealService {

  private apiUrl = 'http://localhost:3000';

  constructor(private httpClient: HttpClient) {}


  getMeals(): Observable<Meal[]> {
  return this.httpClient.get<Meal[]>('http://localhost:3000/meals')
}



  getMeal(id: string): Observable<Meal> {
    return this.httpClient.get<Meal>(`${this.apiUrl}/meals/${id}`).pipe(
      switchMap(meal =>
        this.httpClient.get<Product[]>(`${this.apiUrl}/products`).pipe(
          map(products => ({
            ...meal,
            items: meal.items.map(item => {
              const product = products.find(p => p.id === item.productId);
              return {
                ...item,
                productName: product?.name ?? 'Nieznany produkt',
                caloriesPer100g: product?.caloriesPer100g ?? 0
              };
            })
          }))
        )
      )
    );
  }

  getMealWithProducts(id: string) {
  return this.getMeal(id).pipe(
    switchMap(meal =>
      this.httpClient.get<Product[]>(`${this.apiUrl}/products`).pipe(
        map(products => {
          const itemsWithDetails = meal.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
              ...item,
              productName: product?.name ?? 'Unknown',
              caloriesPer100g: product?.caloriesPer100g ?? 0
            };
          });
          return { ...meal, items: itemsWithDetails };
        })
      )
    )
  );
}

  addMeal(meal: Meal): Observable<Meal> {
    console.log("tutaj2")
    return this.httpClient.post<Meal>(`${this.apiUrl}/meals`, meal);
  }

  updateMeal(meal: Meal): Observable<Meal> {
    return this.httpClient.put<Meal>(`${this.apiUrl}/meals/${meal.id}`, meal);
  }

  deleteMeal(id: string | undefined): Observable<any> {
    console.log("deleting", id)
    return this.httpClient.delete(`${this.apiUrl}/meals/${id}`);
  }
  
  getProducts(): Observable<Product[]> {
  return this.httpClient.get<Product[]>(`${this.apiUrl}/products`);
  }

}
