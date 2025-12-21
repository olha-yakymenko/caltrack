import { MealItem } from "./meal-item";

export interface Meal {
    id?: string;
    userId: number;
    name: string;
    date: string; 
    items: MealItem[];
    totalCalories?: number;
}
