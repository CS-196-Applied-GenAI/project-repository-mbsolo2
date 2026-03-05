import AsyncStorage from '@react-native-async-storage/async-storage';

const FEED_KEY = 'cache_feed';
const INVENTORY_KEY = 'cache_inventory';
const COOKBOOK_KEY = 'cache_cookbook';
const UPCOMING_KEY = 'cache_upcoming';

export const cacheKeys = {
  feed: FEED_KEY,
  inventory: INVENTORY_KEY,
  cookbook: COOKBOOK_KEY,
  upcoming: UPCOMING_KEY,
} as const;

export async function getJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors
  }
}
