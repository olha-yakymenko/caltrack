import { MealItem } from "./meal-item";

export interface Meal {
    readonly id?: string;
    readonly userId: string;
    readonly name: string;
    readonly date: string; 
    readonly items: MealItem[];
    readonly totalCalories?: number;
}
