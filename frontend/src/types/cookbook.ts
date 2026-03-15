/**
 * Cookbook / saved recipe types.
 * No backend endpoints yet — cookbook is local-only (Zustand + AsyncStorage).
 * Types here prepare for future GET/POST/DELETE saved recipes API.
 */

import type { Recipe } from './recipe';

export type { Recipe } from './recipe';

/** One saved/favorite recipe entry (UI or future API response). */
export interface CookbookEntry {
  recipeId: string;
  recipe?: Recipe;
  /** ISO date string when saved. Frontend-added; future API may provide. */
  savedAt?: string;
  /** Frontend-only: whether user marked as cooked. */
  cookedAt?: string;
}

/**
 * Service/API response shape for a saved recipe (stub for future GET /cookbook/saved).
 * Same as CookbookEntry for now; backend may add server-only fields later.
 */
export interface SavedRecipeSummary {
  recipeId: string;
  recipe?: Recipe;
  savedAt?: string;
}

/** Request body for future POST /cookbook/saved. */
export interface SaveRecipeRequest {
  recipe_id: string;
  recipe?: Recipe;
}
