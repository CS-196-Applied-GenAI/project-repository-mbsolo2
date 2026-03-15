import { apiFetch } from './client';
import type {
  RecipeCandidateResponse,
  MealplanGenerateRequest,
  MealplanGenerateResponse,
} from '../types/recipe';

export type { MealplanRecipe, MealplanGenerateResponse } from '../types/recipe';
export type { RecipeCandidateResponse } from '../types/recipe';
/** @deprecated Use MealplanGenerateResponse. */
export type GenerateMealplanResponse = MealplanGenerateResponse;

export async function generateMealplan(
  request?: MealplanGenerateRequest | null
): Promise<RecipeCandidateResponse[]> {
  const res = await apiFetch<MealplanGenerateResponse>(
    'api/v1/mealplan/generate',
    {
      method: 'POST',
      body: (request ?? {}) as Record<string, unknown>,
    }
  );
  return res.visible_candidates ?? [];
}
