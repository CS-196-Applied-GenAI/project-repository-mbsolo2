import { create } from 'zustand';

import { cacheKeys, getJson, setJson } from '../services/cache';

export const DIETARY_RESTRICTION_IDS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'keto',
  'paleo',
] as const;

export const DIETARY_RESTRICTION_LABELS: Record<(typeof DIETARY_RESTRICTION_IDS)[number], string> = {
  'vegetarian': 'Vegetarian',
  'vegan': 'Vegan',
  'gluten-free': 'Gluten Free',
  'dairy-free': 'Dairy Free',
  'keto': 'Keto',
  'paleo': 'Paleo',
};

export type DietaryRestrictionId = (typeof DIETARY_RESTRICTION_IDS)[number];

interface PreferencesCache {
  dietaryRestrictions: string[];
}

function persist(dietaryRestrictions: string[]) {
  setJson(cacheKeys.preferences, { dietaryRestrictions });
}

export const preferencesStore = create<{
  dietaryRestrictions: string[];
  toggleDietary: (id: string) => void;
  loadFromCache: () => Promise<void>;
}>((set, get) => ({
  dietaryRestrictions: [],

  toggleDietary: (id) =>
    set((state) => {
      const has = state.dietaryRestrictions.includes(id);
      const next = has
        ? state.dietaryRestrictions.filter((x) => x !== id)
        : [...state.dietaryRestrictions, id];
      persist(next);
      return { dietaryRestrictions: next };
    }),

  loadFromCache: async () => {
    const data = await getJson<PreferencesCache>(cacheKeys.preferences);
    if (data?.dietaryRestrictions && Array.isArray(data.dietaryRestrictions)) {
      set({ dietaryRestrictions: data.dietaryRestrictions });
    }
  },
}));
