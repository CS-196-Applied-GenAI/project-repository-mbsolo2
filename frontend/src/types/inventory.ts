export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  location: string;
  expiresOn: string; // ISO date string
  expired: boolean;
}
