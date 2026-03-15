/**
 * Inventory service — centralizes inventory API calls.
 * Used by inventoryStore; screens do not call this directly.
 */
import {
  addInventory,
  getInventory,
  deleteInventory,
} from '../api/inventoryApi';

export type { InventoryItemResponse, AddInventoryItem } from '../api/inventoryApi';

export const inventoryService = {
  getList: getInventory,
  addItems: addInventory,
  deleteItem: deleteInventory,
} as const;
