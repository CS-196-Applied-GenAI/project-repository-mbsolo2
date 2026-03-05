import { create } from 'zustand';

import * as inventoryApi from '../api/inventoryApi';
import { cacheKeys, getJson, setJson } from '../services/cache';
import type { InventoryItem } from '../types/inventory';
import { uiStore } from './uiStore';

function mapResponseToItem(r: inventoryApi.InventoryItemResponse): InventoryItem {
  const expiresOn =
    r.expiration_date_user_override ?? r.expiration_date_estimated;
  return {
    id: r.item_id,
    name: r.name,
    quantity: r.quantity,
    location: r.location,
    expiresOn: typeof expiresOn === 'string' ? expiresOn.slice(0, 10) : '',
    expired: r.expired_flag,
  };
}

interface InventoryState {
  items: InventoryItem[];
  error: string | null;
  fetchInventory: () => Promise<void>;
  loadFromCache: () => Promise<void>;
  addInventoryItem: (name: string, quantity: number) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  clearError: () => void;
}

export const inventoryStore = create<InventoryState>((set) => ({
  items: [],
  error: null,
  fetchInventory: async () => {
    set({ error: null });
    try {
      const res = await inventoryApi.getInventory();
      const items = res.map(mapResponseToItem);
      set({ items });
      await setJson(cacheKeys.inventory, { items });
      uiStore.getState().hideOfflineBanner();
    } catch (e) {
      await inventoryStore.getState().loadFromCache();
      set({
        error: e instanceof Error ? e.message : 'Failed to load inventory',
      });
      uiStore.getState().showOfflineBanner();
    }
  },
  loadFromCache: async () => {
    const data = await getJson<{ items: InventoryItem[] }>(cacheKeys.inventory);
    if (data?.items) {
      set({ items: data.items });
    }
  },
  addInventoryItem: async (name, quantity) => {
    set({ error: null });
    try {
      const res = await inventoryApi.addInventory([{ name: name.trim(), quantity }]);
      const newItems = res.map(mapResponseToItem);
      set((state) => ({ items: [...state.items, ...newItems] }));
      const items = inventoryStore.getState().items;
      await setJson(cacheKeys.inventory, { items });
      uiStore.getState().hideOfflineBanner();
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to add item',
      });
    }
  },
  deleteInventoryItem: async (id) => {
    set({ error: null });
    try {
      await inventoryApi.deleteInventory(id);
      set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      const items = inventoryStore.getState().items;
      await setJson(cacheKeys.inventory, { items });
      uiStore.getState().hideOfflineBanner();
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to delete item',
      });
    }
  },
  clearError: () => set({ error: null }),
}));

const EXPIRING_SOON_DAYS = 3;

export function expiringSoon(items: InventoryItem[]): InventoryItem[] {
  const now = new Date();
  const soon = new Date(now);
  soon.setDate(soon.getDate() + EXPIRING_SOON_DAYS);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return items.filter((item) => {
    if (item.expired) return false;
    const exp = new Date(item.expiresOn);
    return exp >= today && exp <= soon;
  });
}

export function byLocation(items: InventoryItem[]): Record<string, InventoryItem[]> {
  const map: Record<string, InventoryItem[]> = { fridge: [], pantry: [], freezer: [] };
  const other: InventoryItem[] = [];
  for (const item of items) {
    const loc = item.location.toLowerCase();
    if (loc === 'fridge' || loc === 'pantry' || loc === 'freezer') {
      map[loc].push(item);
    } else {
      other.push(item);
    }
  }
  if (other.length > 0) map.other = other;
  return map;
}
