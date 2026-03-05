import { create } from 'zustand';

export type Bucket = 'today' | 'tomorrow' | 'later';

export interface PinnedItem {
  recipeId: string;
  bucket: Bucket;
  scheduledDate?: string;
}

interface UpcomingState {
  pinned: PinnedItem[];
  pinRecipe: (recipeId: string, bucket?: Bucket) => void;
}

export const upcomingStore = create<UpcomingState>((set) => ({
  pinned: [],
  pinRecipe: (recipeId, bucket = 'later') =>
    set((state) => ({
      pinned: [...state.pinned, { recipeId, bucket }],
    })),
}));
