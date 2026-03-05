import { create } from 'zustand';

import type { Recipe } from '../types/recipe';

interface FeedState {
  recipes: Recipe[];
  passedRecipeIds: string[];
  selectedRecipeId: string | undefined;
  setRecipes: (recipes: Recipe[]) => void;
  passRecipe: (id: string) => void;
  undoPass: (id: string) => void;
  setSelectedRecipeId: (id: string | undefined) => void;
}

export const feedStore = create<FeedState>((set) => ({
  recipes: [],
  passedRecipeIds: [],
  selectedRecipeId: undefined,
  setRecipes: (recipes) => set({ recipes }),
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
