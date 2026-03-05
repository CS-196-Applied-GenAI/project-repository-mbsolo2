import { apiFetch } from './client';

export interface MealplanRecipe {
  recipe_id: string;
  title: string;
  servings: number;
  ingredients: Array<{ name: string; amount: number; unit: string }>;
  instructions: string[];
}

export interface GenerateMealplanResponse {
  visible_candidates: MealplanRecipe[];
  candidate_pool_size: number;
}

export async function generateMealplan(): Promise<MealplanRecipe[]> {
  const res = await apiFetch<GenerateMealplanResponse>('api/v1/mealplan/generate', {
    method: 'POST',
    body: {},
  });
  return res.visible_candidates ?? [];
}
