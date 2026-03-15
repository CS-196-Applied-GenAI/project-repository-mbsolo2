/**
 * Recipe types — aligned with backend API where endpoints exist.
 * Backend: POST /api/v1/mealplan/generate (RecipeCandidate list).
 * Schemas: app.schemas.recipe (Ingredient, RecipeCandidate), app.schemas.mealplan
 * No GET /recipes/:id or recipe detail endpoint yet.
 */

/** Single ingredient in recipe. Matches backend Ingredient (amount: float | int). */
export interface IngredientResponse {
  name: string;
  amount: number;
  unit: string;
}

/** Recipe as returned by mealplan/generate (visible_candidates). Matches backend RecipeCandidate. */
export interface RecipeCandidateResponse {
  recipe_id: string;
  title: string;
  servings: number;
  ingredients: IngredientResponse[];
  instructions: string[];
}

/** Alias for API compatibility. */
export type MealplanRecipe = RecipeCandidateResponse;

/** POST /api/v1/mealplan/generate request body. Matches backend MealplanGenerateRequest. */
export interface MealplanGenerateRequest {
  preferences?: Record<string, unknown> | null;
  /** User-created recipes; backend merges with provider pool and scores by inventory. */
  user_recipes?: RecipeCandidateResponse[] | null;
}

/** POST /api/v1/mealplan/generate response. Matches backend MealplanGenerateResponse. */
export interface MealplanGenerateResponse {
  visible_candidates: RecipeCandidateResponse[];
  candidate_pool_size: number;
}

/**
 * Domain model for UI (Feed, Cookbook, Detail).
 * id is mapped from recipe_id. Fields not from current backend are frontend-only or placeholders for future API.
 */
export interface Recipe {
  id: string;
  title: string;
  /** Frontend-only / future API. Backend RecipeCandidate has no cuisine. */
  cuisine: string;
  /** Frontend-only / future API. Backend has no prep time. */
  totalMinutes: number;
  servings: number;
  /** Frontend-only / future API (e.g. dietary tags). */
  tags: string[];
  /** Frontend-only / future API (e.g. "expiring soon", "pantry staples"). */
  why: string[];
  /** Full ingredients from API (name, amount, unit). When set, use for detail view. */
  ingredients?: IngredientResponse[];
  /** Mapped from ingredients[].name in backend response. */
  ingredientsHave: string[];
  /** Frontend-only / future API (ingredients to buy). */
  ingredientsMaybeWant: string[];
  instructions: string[];
  /** Frontend-only (local photo URI or future image_url). */
  photoUri?: string;
  /** Frontend-only / future API (leftover safety note). */
  leftoverNote?: string;
}

/**
 * Recipe in detail view. Backend has no separate detail endpoint; we use Recipe.
 * When GET /recipes/:id exists, a RecipeDetailResponse can extend RecipeCandidateResponse with extra fields.
 */
export type RecipeDetail = Recipe;
