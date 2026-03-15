/**
 * Client-side ingredient matching for display (e.g. "X of Y in your kitchen", missing list).
 * Backend does its own matching for scoring; this is for UI only.
 */

import { expiringSoon } from '../store/inventoryStore';
import type { InventoryItem } from '../types/inventory';

function tokens(s: string): Set<string> {
  return new Set(s.toLowerCase().replace(/,/g, ' ').split(/\s+/).filter(Boolean));
}

function matchesInventory(ingredientName: string, items: InventoryItem[]): boolean {
  const ingLower = ingredientName.toLowerCase();
  const ingTokens = tokens(ingredientName);
  for (const item of items) {
    const nameLower = item.name.toLowerCase();
    const nameTokens = tokens(item.name);
    if (ingTokens.size > 0 && nameTokens.size > 0) {
      for (const t of ingTokens) {
        if (nameLower.includes(t) || Array.from(nameTokens).some((n) => n.includes(t) || t.includes(n))) {
          return true;
        }
      }
    }
    if (ingLower.includes(nameLower) || nameLower.includes(ingLower)) return true;
  }
  return false;
}

export interface InventoryMatchResult {
  inKitchenCount: number;
  totalCount: number;
  missingIngredients: string[];
}

/**
 * Given recipe ingredient names and current inventory, return how many match and which are missing.
 */
export function matchRecipeToInventory(
  ingredientNames: string[],
  inventoryItems: InventoryItem[]
): InventoryMatchResult {
  const totalCount = ingredientNames.length;
  const missing: string[] = [];
  let inKitchenCount = 0;
  for (const name of ingredientNames) {
    if (matchesInventory(name, inventoryItems)) {
      inKitchenCount += 1;
    } else {
      missing.push(name);
    }
  }
  return { inKitchenCount, totalCount, missingIngredients: missing };
}

/**
 * Returns true if the recipe uses at least one ingredient that exists in inventory
 * and that item expires within the app's "expiring soon" threshold (same as inventory expiringSoon).
 */
export function recipeUsesExpiringSoonIngredient(
  ingredientNames: string[],
  inventoryItems: InventoryItem[]
): boolean {
  const soonItems = expiringSoon(inventoryItems);
  for (const name of ingredientNames) {
    if (matchesInventory(name, soonItems)) return true;
  }
  return false;
}
