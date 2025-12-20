import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { Meal } from '../interfaces/meal';
import { HttpClient } from '@angular/common/http';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root',
})
export class MealService {

  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getMeals(userId: number): Observable<Meal[]> {
    return this.http.get<Meal[]>(`${this.apiUrl}/meals?userId=${userId}`).pipe(
      switchMap(meals =>
        this.http.get<Product[]>(`${this.apiUrl}/products`).pipe(
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


  getMeal(id: number): Observable<Meal> {
    return this.http.get<Meal>(`${this.apiUrl}/meals/${id}`);
  }

  addMeal(meal: Meal): Observable<Meal> {
    return this.http.post<Meal>(`${this.apiUrl}/meals`, meal);
  }

  updateMeal(meal: Meal): Observable<Meal> {
    return this.http.put<Meal>(`${this.apiUrl}/meals/${meal.id}`, meal);
  }

  deleteMeal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/meals/${id}`);
  }
  
}
