import { Component, inject } from '@angular/core';
import { AuthService } from '../serivces/auth.service';
import { MealService } from '../serivces/meal.service';
import { combineLatest, map } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private authService = inject(AuthService);
  private mealService = inject(MealService);

  public stats$ = combineLatest([
    this.authService.currentUser$,
    this.mealService.getMeals()
  ]).pipe(
    map(([user, meals]) => {
      if (!user) return null;

      const today = new Date().toISOString().split('T')[0]; // Pobiera format YYYY-MM-DD
      
      const todaysMeals = meals.filter((meal) => 
        meal.userId === user.id && 
        meal.date.startsWith(today)
      );

      const consumed = todaysMeals.reduce((acc, meal) => acc + (meal.totalCalories || 0), 0);
      const limit = user.dailyCalorieLimit || 0; 

      return {
        userName: user.name,
        limit: limit,
        consumed: consumed,
        remaining: limit - consumed,
        percent: limit > 0 ? Math.min((consumed / limit) * 100, 100) : 0
      };
    })
  );

  public getRingGradient(percent: number, isOverLimit: boolean): string {
    const color = isOverLimit ? '#ff4d4d' : '#4caf50';
    
return `conic-gradient(${color} ${percent * 3.6}deg, #eee 0deg)`;
  }
}