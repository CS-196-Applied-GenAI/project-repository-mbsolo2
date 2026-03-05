import { create } from 'zustand';

import type { InventoryItem } from '../types/inventory';

const DEFAULT_DAYS_UNTIL_EXPIRY = 7;
const EXPIRING_SOON_DAYS = 3;

function nextWeekISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + DEFAULT_DAYS_UNTIL_EXPIRY);
  return d.toISOString().slice(0, 10);
}

function generateId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface InventoryState {
  items: InventoryItem[];
  addLocalItem: (name: string, quantity: number) => void;
  removeLocalItem: (id: string) => void;
}

export const inventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  addLocalItem: (name, quantity) =>
    set((state) => ({
      items: [
        ...state.items,
        {
          id: generateId(),
          name: name.trim(),
          quantity,
          location: 'pantry',
          expiresOn: nextWeekISO(),
          expired: false,
        },
      ],
    })),
  removeLocalItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
}));

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
