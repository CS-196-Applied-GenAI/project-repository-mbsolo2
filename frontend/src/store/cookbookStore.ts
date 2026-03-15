import { create } from 'zustand';

import { cacheKeys, getJson, setJson } from '../services/cache';
import type { Recipe } from '../types/recipe';
import { upcomingStore } from './upcomingStore';

export type CookbookFilter = 'all' | 'cooked' | 'favorites' | 'my-recipes';

interface CookbookCache {
  recipesById: Record<string, Recipe>;
  favorites: string[];
  myRecipeIds: string[];
  cookedRecipeIds: string[];
}

function persist(state: CookbookCache): Promise<void> {
  return setJson(cacheKeys.cookbook, state);
}

export const cookbookStore = create<{
  recipesById: Record<string, Recipe>;
  favorites: string[];
  myRecipeIds: string[];
  cookedRecipeIds: string[];
  heartRecipe: (recipeId: string, recipe?: Recipe) => void;
  unheartRecipe: (recipeId: string) => void;
  addMyRecipe: (recipe: Omit<Recipe, 'id'>) => string;
  updateRecipe: (recipeId: string, data: Omit<Recipe, 'id'>) => void;
  deleteRecipe: (recipeId: string) => Promise<void>;
  markAsCooked: (recipeId: string, recipe?: Recipe) => Promise<void>;
  unmarkAsCooked: (recipeId: string) => Promise<void>;
  loadFromCache: () => Promise<void>;
  getFilteredRecipes: (filter: CookbookFilter) => Recipe[];
}>((set, get) => ({
  recipesById: {},
  favorites: [],
  myRecipeIds: [],
  cookedRecipeIds: [],

  heartRecipe: (recipeId, recipe) =>
    set((state) => {
      if (state.favorites.includes(recipeId)) return state;
      const recipesById =
        recipe != null
          ? { ...state.recipesById, [recipeId]: recipe }
          : state.recipesById;
      const favorites = [...state.favorites, recipeId];
      persist({ recipesById, favorites, myRecipeIds: state.myRecipeIds, cookedRecipeIds: state.cookedRecipeIds });
      return { recipesById, favorites };
    }),

  unheartRecipe: (recipeId) =>
    set((state) => {
      const favorites = state.favorites.filter((id) => id !== recipeId);
      persist({ ...state, favorites });
      return { favorites };
    }),

  addMyRecipe: (recipeData) => {
    const id = `my-${Date.now()}`;
    const recipe: Recipe = { ...recipeData, id };
    set((state) => {
      const recipesById = { ...state.recipesById, [id]: recipe };
      const myRecipeIds = [...state.myRecipeIds, id];
      persist({ recipesById, favorites: state.favorites, myRecipeIds, cookedRecipeIds: state.cookedRecipeIds });
      return { recipesById, myRecipeIds };
    });
    return id;
  },

  updateRecipe: (recipeId, data) => {
    set((state) => {
      const existing = state.recipesById[recipeId];
      if (!existing) return state;
      const recipe: Recipe = { ...data, id: recipeId };
      const recipesById = { ...state.recipesById, [recipeId]: recipe };
      persist({ ...state, recipesById });
      return { recipesById };
    });
  },

  deleteRecipe: async (recipeId) => {
    upcomingStore.getState().unpinRecipe(recipeId);
    set((state) => {
      const { [recipeId]: _, ...recipesById } = state.recipesById;
      const favorites = state.favorites.filter((id) => id !== recipeId);
      const myRecipeIds = state.myRecipeIds.filter((id) => id !== recipeId);
      const cookedRecipeIds = state.cookedRecipeIds.filter((id) => id !== recipeId);
      return { recipesById, favorites, myRecipeIds, cookedRecipeIds };
    });
    await persist(get());
  },

  markAsCooked: async (recipeId, recipe) => {
    const state = get();
    if (state.cookedRecipeIds.includes(recipeId)) return;
    const cookedRecipeIds = [...state.cookedRecipeIds, recipeId];
    const recipesById =
      recipe != null && !(recipeId in state.recipesById)
        ? { ...state.recipesById, [recipeId]: recipe }
        : state.recipesById;
    set({ recipesById, cookedRecipeIds });
    await persist(get());
  },

  unmarkAsCooked: async (recipeId) => {
    const state = get();
    const cookedRecipeIds = state.cookedRecipeIds.filter((id) => id !== recipeId);
    set({ cookedRecipeIds });
    await persist(get());
  },

  loadFromCache: async () => {
    const data = await getJson<CookbookCache & { myRecipes?: string[] }>(cacheKeys.cookbook);
    if (!data) return;
    if (data.recipesById) set({ recipesById: data.recipesById });
    if (data.favorites) set({ favorites: data.favorites });
    if (data.myRecipeIds) set({ myRecipeIds: data.myRecipeIds });
    else if (data.myRecipes) set({ myRecipeIds: data.myRecipes });
    if (data.cookedRecipeIds) set({ cookedRecipeIds: data.cookedRecipeIds });
  },

  getFilteredRecipes: (filter) => {
    const { recipesById, favorites, myRecipeIds, cookedRecipeIds } = get();
    const list = Object.values(recipesById);
    switch (filter) {
      case 'favorites':
        return list.filter((r) => favorites.includes(r.id));
      case 'my-recipes':
        return list.filter((r) => myRecipeIds.includes(r.id));
      case 'cooked':
        return list.filter((r) => cookedRecipeIds.includes(r.id));
      case 'all':
      default:
        return list;
    }
  },
}));
