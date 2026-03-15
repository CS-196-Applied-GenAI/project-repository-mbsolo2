import { create } from 'zustand';

import { cacheKeys, getJson, setJson } from '../services/cache';
import {
  inventoryService,
  type InventoryItemResponse,
} from '../services/inventoryService';
import type { InventoryItem } from '../types/inventory';
import { uiStore } from './uiStore';

function mapResponseToItem(r: InventoryItemResponse): InventoryItem {
  const expiresOn =
    r.expiration_date_user_override ?? r.expiration_date_estimated;
  return {
    id: r.item_id,
    name: r.name,
    quantity: r.quantity,
    category: r.category,
    location: r.location,
    expiresOn: typeof expiresOn === 'string' ? expiresOn.slice(0, 10) : '',
    expired: r.expired_flag,
  };
}

export interface InventoryState {
  items: InventoryItem[];
  error: string | null;
  loading: boolean;
  /** Set during delete so UI can show loading for that row. */
  deletingItemId: string | null;
  /** Set during replace/update so UI can show loading for that row. */
  updatingItemId: string | null;
  fetchInventory: () => Promise<void>;
  loadFromCache: () => Promise<void>;
  addInventoryItem: (name: string, quantity: number, expirationDate?: string | null) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  /** Replace item (edit): delete old then add with new name/quantity/expiration/category. Backend has no PATCH. */
  replaceItem: (oldId: string, name: string, quantity: number, expirationDate?: string | null, category?: string | null) => Promise<void>;
  /** Change quantity by delta; implemented as delete + add. If quantity would be ≤ 0, deletes item. */
  updateQuantity: (itemId: string, delta: number) => Promise<void>;
  clearError: () => void;
}

export const inventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  error: null,
  loading: false,
  deletingItemId: null,
  updatingItemId: null,
  fetchInventory: async () => {
    set({ error: null, loading: true });
    try {
      const res = await inventoryService.getList();
      const items = res.map(mapResponseToItem);
      set({ items, loading: false });
      await setJson(cacheKeys.inventory, { items });
      uiStore.getState().hideOfflineBanner();
    } catch (e) {
      await inventoryStore.getState().loadFromCache();
      set({
        error: e instanceof Error ? e.message : 'Failed to load inventory',
        loading: false,
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
  addInventoryItem: async (name, quantity, expirationDate) => {
    set({ error: null });
    try {
      const payload: { name: string; quantity: number; expiration_date?: string | null } = {
        name: name.trim(),
        quantity,
      };
      if (expirationDate != null && expirationDate.trim() !== '') {
        payload.expiration_date = expirationDate.trim().slice(0, 10);
      }
      const res = await inventoryService.addItems([payload]);
      const newItems = res.map(mapResponseToItem);
      set((state) => ({ items: [...state.items, ...newItems] }));
      const items = inventoryStore.getState().items;
      await setJson(cacheKeys.inventory, { items });
      uiStore.getState().hideOfflineBanner();
      uiStore.getState().setFeedStale(true);
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to add item',
      });
    }
  },
  deleteInventoryItem: async (id) => {
    const previousItems = get().items;
    const itemToRemove = previousItems.find((i) => i.id === id);
    set({ error: null, deletingItemId: id });
    set((state) => ({ items: state.items.filter((i) => i.id !== id), deletingItemId: null }));
    try {
      await inventoryService.deleteItem(id);
      const items = get().items;
      await setJson(cacheKeys.inventory, { items });
      uiStore.getState().hideOfflineBanner();
      uiStore.getState().setFeedStale(true);
    } catch (e) {
      if (itemToRemove) {
        set((state) => ({ items: [...state.items, itemToRemove].sort((a, b) => a.name.localeCompare(b.name)) }));
      }
      set({
        error: e instanceof Error ? e.message : 'Failed to delete item',
      });
    }
  },
  replaceItem: async (oldId, name, quantity, expirationDate, category) => {
    set({ error: null, updatingItemId: oldId });
    try {
      await inventoryService.deleteItem(oldId);
      set((state) => ({ items: state.items.filter((i) => i.id !== oldId) }));
      const payload: {
        name: string;
        quantity: number;
        expiration_date?: string | null;
        category?: string | null;
      } = {
        name: name.trim(),
        quantity,
      };
      if (expirationDate != null && expirationDate.trim() !== '') {
        payload.expiration_date = expirationDate.trim().slice(0, 10);
      }
      if (category != null && category.trim() !== '') {
        payload.category = category.trim();
      }
      const res = await inventoryService.addItems([payload]);
      const newItems = res.map(mapResponseToItem);
      set((state) => ({ items: [...state.items, ...newItems], updatingItemId: null }));
      const items = get().items;
      await setJson(cacheKeys.inventory, { items });
      uiStore.getState().hideOfflineBanner();
      uiStore.getState().setFeedStale(true);
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to update item',
        updatingItemId: null,
      });
    }
  },
  updateQuantity: async (itemId, delta) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item) return;
    const newQ = Math.max(0, item.quantity + delta);
    if (newQ <= 0) {
      await get().deleteInventoryItem(itemId);
      return;
    }
    await get().replaceItem(itemId, item.name, newQ);
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

/** Items at or below this quantity are considered low stock. Derived from backend quantity. */
const LOW_STOCK_THRESHOLD = 2;

export function lowStock(items: InventoryItem[]): InventoryItem[] {
  return items.filter((item) => item.quantity <= LOW_STOCK_THRESHOLD);
}

/** Group items by backend category; uncategorized go under "Other". */
export function byCategory(items: InventoryItem[]): { title: string; data: InventoryItem[] }[] {
  const map = new Map<string, InventoryItem[]>();
  for (const item of items) {
    const key = (item.category?.trim() || 'other').toLowerCase();
    const title = key === 'other' ? 'Other' : key.charAt(0).toUpperCase() + key.slice(1);
    if (!map.has(title)) map.set(title, []);
    map.get(title)!.push(item);
  }
  const titles = Array.from(map.keys()).sort((a, b) => (a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b)));
  return titles.map((title) => ({ title, data: map.get(title)! }));
}
