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

  constructor(protected mealService: MealService){}

  ngOnInit(){
    console.log("tutaj")
    this.mealService.getMeals(1).subscribe((res) =>{
      this.meals = res;
    });
  }

  deleteMeal(id: number){
    this.mealService.deleteMeal(id)
  }
}
