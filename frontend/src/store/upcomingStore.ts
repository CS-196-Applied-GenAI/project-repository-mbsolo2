import { create } from 'zustand';

import { cacheKeys, getJson, setJson } from '../services/cache';

export type Bucket = 'today' | 'tomorrow' | 'later';

export interface PinnedItem {
  recipeId: string;
  bucket: Bucket;
  scheduledDate?: string;
}

function persist(pinned: PinnedItem[]): Promise<void> {
  return setJson(cacheKeys.upcoming, { pinned });
}

interface UpcomingState {
  pinned: PinnedItem[];
  pinRecipe: (recipeId: string, bucket?: Bucket) => Promise<void>;
  unpinRecipe: (recipeId: string) => Promise<void>;
  loadFromCache: () => Promise<void>;
}

export const upcomingStore = create<UpcomingState>((set, get) => ({
  pinned: [],

  pinRecipe: async (recipeId, bucket = 'later') => {
    const state = get();
    if (state.pinned.some((p) => p.recipeId === recipeId)) return;
    const pinned = [...state.pinned, { recipeId, bucket }];
    set({ pinned });
    await persist(pinned);
  },

  unpinRecipe: async (recipeId) => {
    const state = get();
    const pinned = state.pinned.filter((p) => p.recipeId !== recipeId);
    set({ pinned });
    await persist(pinned);
  },

  loadFromCache: async () => {
    const data = await getJson<{ pinned: PinnedItem[] }>(cacheKeys.upcoming);
    if (data?.pinned) set({ pinned: data.pinned });
  },
}));
