import { create } from 'zustand';

import { cacheKeys, getJson, setJson } from '../services/cache';

interface CookbookState {
  favorites: string[];
  myRecipes: string[];
  heartRecipe: (recipeId: string) => void;
  unheartRecipe: (recipeId: string) => void;
  addMyRecipe: (recipeId: string) => void;
  loadFromCache: () => Promise<void>;
}

export const cookbookStore = create<CookbookState>((set) => ({
  favorites: [],
  myRecipes: [],
  heartRecipe: (recipeId) =>
    set((state) => {
      const next =
        state.favorites.includes(recipeId)
          ? state
          : { favorites: [...state.favorites, recipeId] };
      setJson(cacheKeys.cookbook, {
        favorites: next.favorites,
        myRecipes: state.myRecipes,
      });
      return next;
    }),
  unheartRecipe: (recipeId) =>
    set((state) => {
      const favorites = state.favorites.filter((id) => id !== recipeId);
      setJson(cacheKeys.cookbook, { favorites, myRecipes: state.myRecipes });
      return { favorites };
    }),
  addMyRecipe: (recipeId) =>
    set((state) => {
      const next =
        state.myRecipes.includes(recipeId)
          ? state
          : { myRecipes: [...state.myRecipes, recipeId] };
      setJson(cacheKeys.cookbook, {
        favorites: state.favorites,
        myRecipes: next.myRecipes,
      });
      return next;
    }),
  loadFromCache: async () => {
    const data = await getJson<{
      favorites: string[];
      myRecipes: string[];
    }>(cacheKeys.cookbook);
    if (data?.favorites) set({ favorites: data.favorites });
    if (data?.myRecipes) set({ myRecipes: data.myRecipes });
  },
}));
