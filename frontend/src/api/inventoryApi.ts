import { apiFetch } from './client';
import type {
  InventoryItemResponse,
  InventoryCreateItemRequest,
  InventoryCreateRequest,
} from '../types/inventory';

export type { InventoryItemResponse, InventoryCreateItemRequest } from '../types/inventory';

/** @deprecated Use InventoryCreateItemRequest from types. Kept for backward compatibility. */
export type AddInventoryItem = InventoryCreateItemRequest;

export async function getInventory(): Promise<InventoryItemResponse[]> {
  return apiFetch<InventoryItemResponse[]>('api/v1/inventory');
}

export async function addInventory(
  items: InventoryCreateItemRequest[]
): Promise<InventoryItemResponse[]> {
  const payload: InventoryCreateRequest = { items };
  return apiFetch<InventoryItemResponse[]>('api/v1/inventory', {
    method: 'POST',
    body: payload as unknown as Record<string, unknown>,
  });
}

export async function deleteInventory(itemId: string): Promise<void> {
  await apiFetch<void>(`api/v1/inventory/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
  });
}
