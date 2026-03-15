/**
 * Centralized frontend types — aligned with backend contracts where they exist.
 * Re-export from here for a single import path.
 */

export type {
  InventoryItemResponse,
  InventoryCreateItemRequest,
  InventoryCreateRequest,
  InventoryItem,
} from './inventory';

export type {
  IngredientResponse,
  RecipeCandidateResponse,
  MealplanRecipe,
  MealplanGenerateRequest,
  MealplanGenerateResponse,
  Recipe,
  RecipeDetail,
} from './recipe';

export type {
  CookbookEntry,
  SavedRecipeSummary,
  SaveRecipeRequest,
} from './cookbook';

export type {
  UserProfile,
  ProfileSummary,
  ProfileUpdateRequest,
} from './profile';
