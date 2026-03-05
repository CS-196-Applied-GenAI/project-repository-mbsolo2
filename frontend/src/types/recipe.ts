export interface Recipe {
  id: string;
  title: string;
  cuisine: string;
  totalMinutes: number;
  servings: number;
  tags: string[];
  why: string[];
  ingredientsHave: string[];
  ingredientsMaybeWant: string[];
  instructions: string[];
  photoUri?: string;
  leftoverNote?: string;
}
