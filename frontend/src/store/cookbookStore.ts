import { create } from 'zustand';

interface CookbookState {
  favorites: string[];
  myRecipes: string[];
  heartRecipe: (recipeId: string) => void;
  unheartRecipe: (recipeId: string) => void;
  addMyRecipe: (recipeId: string) => void;
}

export const cookbookStore = create<CookbookState>((set) => ({
  favorites: [],
  myRecipes: [],
  heartRecipe: (recipeId) =>
    set((state) =>
      state.favorites.includes(recipeId)
        ? state
        : { favorites: [...state.favorites, recipeId] }
    ),
  unheartRecipe: (recipeId) =>
    set((state) => ({
      favorites: state.favorites.filter((id) => id !== recipeId),
    })),
  addMyRecipe: (recipeId) =>
    set((state) =>
      state.myRecipes.includes(recipeId)
        ? state
        : { myRecipes: [...state.myRecipes, recipeId] }
    ),
}));
