import {
  addInventory,
  deleteInventory,
  getInventory,
} from '../api/inventoryApi';

const mockApiFetch = jest.fn();

jest.mock('../api/client', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

beforeEach(() => {
  mockApiFetch.mockReset();
});

describe('inventoryApi', () => {
  describe('getInventory', () => {
    it('calls apiFetch with GET api/v1/inventory', async () => {
      mockApiFetch.mockResolvedValue([]);
      await getInventory();
      expect(mockApiFetch).toHaveBeenCalledTimes(1);
      expect(mockApiFetch).toHaveBeenCalledWith('api/v1/inventory');
    });
  });

  describe('addInventory', () => {
    it('calls apiFetch with POST api/v1/inventory and body { items }', async () => {
      mockApiFetch.mockResolvedValue([]);
      await addInventory([{ name: 'Milk', quantity: 2 }]);
      expect(mockApiFetch).toHaveBeenCalledTimes(1);
      expect(mockApiFetch).toHaveBeenCalledWith('api/v1/inventory', {
        method: 'POST',
        body: { items: [{ name: 'Milk', quantity: 2 }] },
      });
    });
  });

  describe('deleteInventory', () => {
    it('calls apiFetch with DELETE api/v1/inventory/:id', async () => {
      mockApiFetch.mockResolvedValue(undefined);
      await deleteInventory('item-123');
      expect(mockApiFetch).toHaveBeenCalledTimes(1);
      expect(mockApiFetch).toHaveBeenCalledWith(
        'api/v1/inventory/item-123',
        { method: 'DELETE' }
      );
    });

    it('encodes item id in path', async () => {
      mockApiFetch.mockResolvedValue(undefined);
      await deleteInventory('id/with/slash');
      expect(mockApiFetch).toHaveBeenCalledWith(
        'api/v1/inventory/id%2Fwith%2Fslash',
        { method: 'DELETE' }
      );
    });
  });
});
