import AsyncStorage from '@react-native-async-storage/async-storage';
import { getJson, setJson } from '../services/cache';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getJson', () => {
    it('returns parsed JSON when key exists', async () => {
      const value = { recipes: [], passedRecipeIds: [] };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(value)
      );

      const result = await getJson<typeof value>('cache_feed');

      expect(result).toEqual(value);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('cache_feed');
    });

    it('returns null when key is missing', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await getJson('any_key');

      expect(result).toBeNull();
    });

    it('returns null when getItem throws', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('storage error')
      );

      const result = await getJson('any_key');

      expect(result).toBeNull();
    });

    it('returns null when value is invalid JSON', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('not json {');

      const result = await getJson('any_key');

      expect(result).toBeNull();
    });
  });

  describe('setJson', () => {
    it('stringifies and stores value', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      const value = { items: [{ id: '1', name: 'Milk' }] };

      await setJson('cache_inventory', value);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'cache_inventory',
        JSON.stringify(value)
      );
    });

    it('does not throw when setItem fails', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('write error')
      );

      await expect(setJson('key', {})).resolves.toBeUndefined();
    });
  });
});
