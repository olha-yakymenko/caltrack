import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { calorieActions } from './calorie.actions';

@Injectable()
export class CalorieEffects {
  private readonly actions$ = inject(Actions);

  private readonly activityMultipliers: Record<
    'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive',
    number
  > = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  };

  private readonly goalMultipliers: Record<
    'maintain' | 'loss' | 'gain',
    number
  > = {
    maintain: 1,
    loss: 0.85,
    gain: 1.15
  };

  public readonly calculateCalories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(calorieActions.calculateCalories),
      map(({ formData }) => {
        const { gender, age, weight, height, activityLevel, goal } = formData;
        
        if (!age || !weight || !height) {
          throw new Error('Wypełnij wszystkie pola');
        }

        const ageNum = age;
        const weightNum = weight;
        const heightNum = height;

        let bmr: number;
        if (gender === 'male') {
          bmr = (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) + 5;
        } else {
          bmr = (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) - 161;
        }

        bmr = Math.round(bmr);

        const activityMultiplier = this.activityMultipliers[activityLevel];
        const goalMultiplier = this.goalMultipliers[goal];

        const tdee = bmr * activityMultiplier;
        const calories = tdee * goalMultiplier;
        const result = Math.round(calories);

        return calorieActions.calculateCaloriesSuccess({ result, bmr });
      }),
      catchError((error: Error) => 
        of(calorieActions.calculateCaloriesFailure({ 
          error: error.message || 'Wystąpił błąd podczas obliczeń' 
        }))
      )
    )
  );
}