import { create } from 'zustand';

export interface PinnedItem {
  recipeId: string;
  scheduledDate?: string;
}

interface UpcomingState {
  pinned: PinnedItem[];
  pinRecipe: (recipeId: string, scheduledDate?: string) => void;
}

export const upcomingStore = create<UpcomingState>((set) => ({
  pinned: [],
  pinRecipe: (recipeId, scheduledDate) =>
    set((state) => ({
      pinned: [...state.pinned, { recipeId, scheduledDate }],
    })),
}));
