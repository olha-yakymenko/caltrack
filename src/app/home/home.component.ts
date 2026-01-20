import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../serivces/auth.service';
import { MealService } from '../serivces/meal.service';
import { combineLatest, map } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CalorieCalculatorComponent } from '../calorie-calculator/calorie-calculator.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, CommonModule, RouterLink, CalorieCalculatorComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private mealService = inject(MealService);

  public stats$ = combineLatest([
    this.authService.currentUser$,
    this.mealService.getMeals()
  ]).pipe(
    map(([user, meals]) => {
      if (!user) return null;

      const today = new Date().toISOString().split('T')[0];
      
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
        percent: limit > 0 ? Math.min((consumed / limit) * 100, 100) : 0,
        isPremium: user.isPremium || false,
        isActive: user.isActive || false
      };
    })
  );

  public showCalculator = false;
  public isPremiumUser = false;
  public isUserActive = false;

  public ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.isPremiumUser = user?.isPremium || false;
      this.isUserActive = user?.isActive || false;
    });
  }

  public getRingGradient(percent: number, isOverLimit: boolean): string {
    const color = isOverLimit ? '#ff4d4d' : '#4caf50';
    
return `conic-gradient(${color} ${percent * 3.6}deg, #eee 0deg)`;
  }

  public toggleCalculator(): void {
    if (!this.isPremiumUser) {
      alert('Ta funkcja jest dostępna tylko dla użytkowników premium!');
      
return;
    }
    
    if (!this.isUserActive) {
      alert('Twoje konto jest zawieszone. Aktywuj konto, aby korzystać z funkcji premium.');
      
return;
    }
    
    this.showCalculator = !this.showCalculator;
  }

  public onCaloriesCalculated(calories: number): void {
    console.log('Obliczone kalorie:', calories);
    alert(`Obliczone dzienne zapotrzebowanie: ${calories} kcal\nMożesz ustawić tę wartość jako swój dzienny limit w ustawieniach profilu.`);
  }

  public onCalculatorClose(): void {
    this.showCalculator = false;
  }
}