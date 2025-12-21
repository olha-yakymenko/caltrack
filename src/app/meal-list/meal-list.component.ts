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
    this.mealService.getMeals().subscribe((res) =>{
      this.meals = res;
    });
  }

  deleteMeal(id: string | undefined){
    this.mealService.deleteMeal(id).subscribe({
    next: (savedMeal) => {
      console.log("Meal deleted:", savedMeal);
      alert(`Meal deleted with ID: ${savedMeal.id}`);
    },
    error: (err) => {
      console.error("Error deleting meal:", err);
      alert("Failed to delete meal. Check console.");
    },
  });;
  }
}
