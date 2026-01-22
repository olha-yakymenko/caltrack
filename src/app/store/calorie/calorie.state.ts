import { createFeature, createReducer, on } from '@ngrx/store';
import { calorieActions, CalorieFormData } from './calorie.actions';

export interface CalorieState {
  formData: CalorieFormData | null;
  result: number | null;
  bmr: number | null;
  loading: boolean;
  error: string | null;
  history: {
    date: string;
    result: number;
    bmr: number;
    formData: CalorieFormData;
  }[];
  calculationCount: number;
}

export const initialState: CalorieState = {
  formData: null,
  result: null,
  bmr: null,
  loading: false,
  error: null,
  history: [],
  calculationCount: 0
};

export const calorieFeature = createFeature({
  name: 'calorie',
  reducer: createReducer(
    initialState,
    on(calorieActions.calculateCalories, (state, { formData }) => ({
      ...state,
      formData,
      loading: true,
      error: null
    })),
    on(calorieActions.calculateCaloriesSuccess, (state, { result, bmr }) => ({
      ...state,
      result,
      bmr,
      loading: false,
      history: [
        {
          date: new Date().toISOString(),
          result,
          bmr,
          formData: state.formData!
        },
        ...state.history.slice(0, 4)
      ],
      calculationCount: state.calculationCount + 1
    })),
    on(calorieActions.calculateCaloriesFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false
    })),
    on(calorieActions.reset, () => initialState)
  )
});

export const selectHistory = calorieFeature.selectHistory;
export const selectCalculationCount = calorieFeature.selectCalculationCount;