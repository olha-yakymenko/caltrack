import { Meal } from "./meal";

export interface ExtendedMeal extends Meal {
  readonly imageUrl?: string;
  readonly hasImage?: boolean;
}
