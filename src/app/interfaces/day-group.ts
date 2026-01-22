import { Meal } from "./meal";

export interface DayGroup {
  readonly date: string;
  readonly formattedDate: string;
  readonly totalCalories: number;
  readonly meals: Meal[];
  readonly expanded: boolean;
}