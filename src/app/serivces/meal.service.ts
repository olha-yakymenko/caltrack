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

  getMeals(userId: number): Observable<Meal[]> {
    return this.httpClient.get<Meal[]>(`${this.apiUrl}/meals?userId=${userId}`).pipe(
      switchMap(meals =>
        this.httpClient.get<Product[]>(`${this.apiUrl}/products`).pipe(
          map(products => {
            return meals.map(meal => ({
              ...meal,
              totalCalories: meal.items.reduce((acc, item) => {
                const product = products.find(p => p.id === item.productId);
                return acc + (product ? product.caloriesPer100g * item.grams / 100 : 0);
              }, 0)
            }));
          })
        )
      )
    );
  }


//   getMeals(userId: number): Observable<Meal[]> {
//   return this.httpClient.get<Meal[]>('http://localhost:3000/todos')
// }


//   getMeals(): Observable<Meal[]> {
//   return this.httpClient.get<Meal[]>('http://localhost:3000/todos')
// }



  getMeal(id: number): Observable<Meal> {
    return this.httpClient.get<Meal>(`${this.apiUrl}/meals/${id}`);
  }

  addMeal(meal: Meal): Observable<Meal> {
    return this.httpClient.post<Meal>(`${this.apiUrl}/meals`, meal);
  }

  updateMeal(meal: Meal): Observable<Meal> {
    return this.httpClient.put<Meal>(`${this.apiUrl}/meals/${meal.id}`, meal);
  }

  deleteMeal(id: number | undefined): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/meals/${id}`);
  }
  
}
