import { createActionGroup, emptyProps, props } from '@ngrx/store';

export interface CalorieFormData {
  gender: 'male' | 'female';
  age: number | null;
  weight: number | null;
  height: number | null;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  goal: 'maintain' | 'loss' | 'gain';
}

export const calorieActions = createActionGroup({
  source: 'Calorie Calculator',
  events: {
    'Calculate Calories': props<{ 
      formData: CalorieFormData
    }>(),
    'Calculate Calories Success': props<{ 
      result: number; 
      bmr: number 
    }>(),
    'Calculate Calories Failure': props<{ 
      error: string 
    }>(),
    'Reset': emptyProps()
  }
});