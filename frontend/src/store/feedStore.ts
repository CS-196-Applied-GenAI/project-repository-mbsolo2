import { create } from 'zustand';

import * as mealplanApi from '../api/mealplanApi';
import type { Recipe } from '../types/recipe';

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
    const list = await mealplanApi.generateMealplan();
    set({ recipes: list.map(mapMealplanToRecipe) });
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
