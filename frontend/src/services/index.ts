/**
 * Services layer — domain-oriented API access.
 * Stores use these; screens do not call services or API directly.
 */
export { cacheKeys, getJson, setJson } from './cache';

export { inventoryService } from './inventoryService';
export type { InventoryItemResponse, AddInventoryItem } from './inventoryService';

export { recipeService } from './recipeService';
export type { MealplanRecipe, GenerateMealplanResponse } from './recipeService';

export { cookbookService } from './cookbookService';
export type { SavedRecipeSummary } from './cookbookService';

export { profileService } from './profileService';
export type { ProfileSummary } from './profileService';
