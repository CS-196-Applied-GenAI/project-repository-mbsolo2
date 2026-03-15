/**
 * Inventory types — aligned with backend API.
 * Backend: GET/POST /api/v1/inventory, DELETE /api/v1/inventory/{item_id}
 * Schemas: app.schemas.inventory (InventoryItemOut, InventoryCreateRequest)
 */

/** Response shape for GET /api/v1/inventory and POST /api/v1/inventory (each item). */
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

/** Single item in POST /api/v1/inventory body. Matches backend InventoryCreateItem. */
export interface InventoryCreateItemRequest {
  name: string;
  quantity: number;
  /** Optional expiration date (YYYY-MM-DD). Backend uses as expiration_date_user_override. */
  expiration_date?: string | null;
  /** Optional category (e.g. dairy, produce). When omitted, backend infers from name. */
  category?: string | null;
}

/** POST /api/v1/inventory request body. Matches backend InventoryCreateRequest. */
export interface InventoryCreateRequest {
  items: InventoryCreateItemRequest[];
}

/**
 * Domain model for UI. Mapped from InventoryItemResponse in the store.
 * Backend does not provide unit; quantity is numeric only.
 */
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  /** Backend provides category (e.g. dairy, produce). */
  category?: string;
  location: string;
  expiresOn: string;
  expired: boolean;
  /** Optional for future backend support; not in current API. */
  unit?: string;
}
