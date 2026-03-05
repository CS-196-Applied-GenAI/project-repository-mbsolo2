import { create } from 'zustand';

import { cacheKeys, getJson, setJson } from '../services/cache';

export type Bucket = 'today' | 'tomorrow' | 'later';

export interface PinnedItem {
  recipeId: string;
  bucket: Bucket;
  scheduledDate?: string;
}

interface UpcomingState {
  pinned: PinnedItem[];
  pinRecipe: (recipeId: string, bucket?: Bucket) => void;
  loadFromCache: () => Promise<void>;
}

export const upcomingStore = create<UpcomingState>((set) => ({
  pinned: [],
  pinRecipe: (recipeId, bucket = 'later') =>
    set((state) => {
      const pinned = [...state.pinned, { recipeId, bucket }];
      setJson(cacheKeys.upcoming, { pinned });
      return { pinned };
    }),
  loadFromCache: async () => {
    const data = await getJson<{ pinned: PinnedItem[] }>(cacheKeys.upcoming);
    if (data?.pinned) set({ pinned: data.pinned });
  },
}));
