import { MealItem } from "./meal-item";

export interface Meal {
    id?: number;
    userId: number;
    name: string;
    date: string; 
    items: MealItem[];
    totalCalories?: number;
}
