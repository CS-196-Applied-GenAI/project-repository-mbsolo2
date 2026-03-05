import { create } from 'zustand';

import * as mealplanApi from '../api/mealplanApi';
import { cacheKeys, getJson, setJson } from '../services/cache';
import type { Recipe } from '../types/recipe';
import { uiStore } from './uiStore';

function mapMealplanToRecipe(m: mealplanApi.MealplanRecipe): Recipe {
  return {
    id: m.recipe_id,
    title: m.title,
    cuisine: '',
    totalMinutes: 0,
    servings: m.servings,
    tags: [],
    why: [],
    ingredientsHave: m.ingredients.map((i) => i.name),
    ingredientsMaybeWant: [],
    instructions: m.instructions,
  };
}

interface FeedState {
  recipes: Recipe[];
  passedRecipeIds: string[];
  selectedRecipeId: string | undefined;
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
  setRecipes: (recipes) => set({ recipes }),
  fetchFeed: async () => {
    try {
      const list = await mealplanApi.generateMealplan();
      const recipes = list.map(mapMealplanToRecipe);
      set({ recipes });
      const state = feedStore.getState();
      await setJson(cacheKeys.feed, {
        recipes,
        passedRecipeIds: state.passedRecipeIds,
      });
      uiStore.getState().hideOfflineBanner();
    } catch {
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
