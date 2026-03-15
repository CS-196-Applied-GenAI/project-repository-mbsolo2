/**
 * Recipe / discovery and creation service.
 * - getDiscoverRecipes: backend mealplan API (used by feedStore).
 * - createRecipe: local cookbook (no backend); used by Add Recipe flow.
 */
import { generateMealplan } from '../api/mealplanApi';
import { cookbookStore } from '../store/cookbookStore';
import type { Recipe } from '../types/recipe';
import type { MealplanGenerateRequest, RecipeCandidateResponse } from '../types/recipe';

export type { MealplanRecipe, GenerateMealplanResponse } from '../api/mealplanApi';

/** Map a Recipe (domain) to the API RecipeCandidate shape for mealplan/generate request. */
function recipeToCandidate(r: Recipe): RecipeCandidateResponse {
  const ingredients =
    r.ingredients && r.ingredients.length > 0
      ? r.ingredients
      : r.ingredientsHave.map((name) => ({ name, amount: 1, unit: '' }));
  return {
    recipe_id: r.id,
    title: r.title,
    servings: r.servings > 0 ? r.servings : 2,
    ingredients,
    instructions: Array.isArray(r.instructions) ? r.instructions : [],
  };
}

export const recipeService = {
  /** Fetch candidate recipes for Discover feed (mealplan generate). Optionally pass user_recipes to include my-recipes. */
  async getDiscoverRecipes(request?: MealplanGenerateRequest | null): Promise<RecipeCandidateResponse[]> {
    return generateMealplan(request ?? undefined);
  },

  /** Build request body that includes my-recipes from cookbook store for inventory-based discovery. */
  getDiscoverRequestWithMyRecipes(): MealplanGenerateRequest {
    const recipes = cookbookStore.getState().getFilteredRecipes('my-recipes');
    return { user_recipes: recipes.map(recipeToCandidate) };
  },

  /**
   * Create a user recipe and add to cookbook (local store + cache only; no backend).
   * Returns the new recipe id.
   */
  createRecipe(recipeData: Omit<Recipe, 'id'>): string {
    return cookbookStore.getState().addMyRecipe(recipeData);
  },
} as const;
