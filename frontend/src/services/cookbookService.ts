/**
 * Cookbook / saved recipes service.
 * No backend yet — cookbook is local-only (Zustand + AsyncStorage).
 * Stub interface for future GET/POST/DELETE saved recipes API.
 */
import type { Recipe, SavedRecipeSummary } from '../types/cookbook';

export type { SavedRecipeSummary } from '../types/cookbook';

/** Stub: no backend. Return empty so callers can rely on the interface. */
export const cookbookService = {
  /** Stub: returns []. Replace with GET /cookbook/saved when backend exists. */
  async getSavedRecipes(): Promise<SavedRecipeSummary[]> {
    return [];
  },

  /** Stub: no-op. Replace with POST /cookbook/saved when backend exists. */
  async saveRecipe(_recipeId: string, _recipe?: Recipe): Promise<void> {
    // no-op
  },

  /** Stub: no-op. Replace with DELETE /cookbook/saved/:id when backend exists. */
  async removeSavedRecipe(_recipeId: string): Promise<void> {
    // no-op
  },
} as const;
