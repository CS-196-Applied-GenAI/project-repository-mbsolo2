import { apiFetch } from './client';

export interface InventoryItemResponse {
  item_id: string;
  name: string;
  quantity: number;
  created_at: string;
  location: string;
  category: string;
  storage_guidance: string;
  expiration_date_estimated: string;
  expiration_date_user_override: string | null;
  expired_flag: boolean;
}

export interface AddInventoryItem {
  name: string;
  quantity: number;
}

export async function getInventory(): Promise<InventoryItemResponse[]> {
  return apiFetch<InventoryItemResponse[]>('api/v1/inventory');
}

export async function addInventory(items: AddInventoryItem[]): Promise<InventoryItemResponse[]> {
  return apiFetch<InventoryItemResponse[]>('api/v1/inventory', {
    method: 'POST',
    body: { items },
  });
}

export async function deleteInventory(itemId: string): Promise<void> {
  await apiFetch<void>(`api/v1/inventory/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
  });
}
