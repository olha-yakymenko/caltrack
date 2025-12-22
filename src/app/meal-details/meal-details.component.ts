import { Component } from '@angular/core';
import { MealService } from '../serivces/meal.service';
import { ActivatedRoute } from '@angular/router';
import { Meal } from '../interfaces/meal';
import { combineLatest, map, switchMap, tap } from 'rxjs';

interface MealItemWithProduct {
  productId: string;
  grams: number;
  productName: string;
  caloriesPer100g: number;
}

@Component({
  selector: 'app-meal-details',
  templateUrl: './meal-details.component.html',
  styleUrls: ['./meal-details.component.scss']
})
export class MealDetailsComponent {
  meal: Meal | null = null;
  itemsWithDetails: MealItemWithProduct[] = [];

  constructor(private mealService: MealService, private route: ActivatedRoute){}

  ngOnInit() {
    this.route.paramMap.pipe(

      /** switchMap – reaguje na zmianę ID w URL */
      switchMap(params => {
        const id = params.get('id')!;
        return combineLatest([
          this.mealService.getMeal(id),
          this.mealService.getProducts()
        ]);
      }),
      /** tap – debug / efekt uboczny */
      tap(([meal, products]) => {
        console.log('Meal:', meal);
        console.log('Products:', products);
        this.meal = meal;
      }),

      /** map – łączenie danych */
      map(([meal, products]) =>
        meal.items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            productId: item.productId,
            grams: item.grams,
            productName: product?.name ?? 'Nieznany',
            caloriesPer100g: product?.caloriesPer100g ?? 0
          };
        })
      )

    ).subscribe(result => {
      this.itemsWithDetails = result;
    });
  }
}
