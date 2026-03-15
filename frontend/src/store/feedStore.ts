import { create } from 'zustand';

import { cacheKeys, getJson, setJson } from '../services/cache';
import { recipeService, type MealplanRecipe } from '../services/recipeService';
import type { Recipe } from '../types/recipe';
import { uiStore } from './uiStore';

function mapMealplanToRecipe(m: MealplanRecipe): Recipe {
  return {
    id: m.recipe_id,
    title: m.title,
    cuisine: '',
    totalMinutes: 0,
    servings: m.servings,
    tags: [],
    why: [],
    ingredients: m.ingredients,
    ingredientsHave: m.ingredients.map((i) => i.name),
    ingredientsMaybeWant: [],
    instructions: m.instructions,
  };
}

interface FeedState {
  recipes: Recipe[];
  passedRecipeIds: string[];
  selectedRecipeId: string | undefined;
  feedError: string | null;
  setRecipes: (recipes: Recipe[]) => void;
  fetchFeed: () => Promise<void>;
  loadFromCache: () => Promise<void>;
  passRecipe: (id: string) => void;
  undoPass: (id: string) => void;
  setSelectedRecipeId: (id: string | undefined) => void;
}

export const feedStore = create<FeedState>((set) => ({
  recipes: [],
  passedRecipeIds: [],
  selectedRecipeId: undefined,
  feedError: null,
  setRecipes: (recipes) => set({ recipes }),
  fetchFeed: async () => {
    try {
      set({ feedError: null });
      const request = recipeService.getDiscoverRequestWithMyRecipes();
      const list = await recipeService.getDiscoverRecipes(request);
      const recipes = list.map(mapMealplanToRecipe);
      set({ recipes });
      const state = feedStore.getState();
      await setJson(cacheKeys.feed, {
        recipes,
        passedRecipeIds: state.passedRecipeIds,
      });
      uiStore.getState().hideOfflineBanner();
      uiStore.getState().setFeedStale(false);
    } catch {
      set({
        feedError: 'We couldn’t load new recipes. Pull to try again or we’ll show cached recipes.',
      });
      await feedStore.getState().loadFromCache();
      uiStore.getState().showOfflineBanner();
    }
  },
  loadFromCache: async () => {
    const data = await getJson<{ recipes: Recipe[]; passedRecipeIds: string[] }>(
      cacheKeys.feed
    );
    if (data?.recipes) {
      set({ recipes: data.recipes });
      if (data.passedRecipeIds != null) {
        set({ passedRecipeIds: data.passedRecipeIds });
      }
    }
  },
  passRecipe: (id) =>
    set((state) => ({
      passedRecipeIds: state.passedRecipeIds.includes(id)
        ? state.passedRecipeIds
        : [...state.passedRecipeIds, id],
    })),
  undoPass: (id) =>
    set((state) => ({
      passedRecipeIds: state.passedRecipeIds.filter((x) => x !== id),
    })),
  setSelectedRecipeId: (selectedRecipeId) => set({ selectedRecipeId }),
}));
