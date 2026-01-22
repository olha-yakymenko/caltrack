export interface Product {
    readonly id: string;
    readonly name: string;
    readonly caloriesPer100g: number;
    readonly userId?: string;
}
