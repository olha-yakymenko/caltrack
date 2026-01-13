import { MealItem } from "./meal-item";

export interface Meal {
    id?: string;
    userId: string;
    name: string;
    date: string; 
    items: MealItem[];
    totalCalories?: number;
}
