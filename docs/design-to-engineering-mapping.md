# Cookbook App — Design-to-Engineering Mapping

Structured implementation checklist mapping each design screen to target files, components, data, APIs, and implementation status. Use this to apply Figma designs screen-by-screen without changing behavior until you intentionally do so.

---

## Screen 1: Discover

| Item | Details |
|------|--------|
| **1. Target frontend file(s)** | `frontend/src/screens/FeedScreen.tsx` (main screen), `frontend/src/navigation/BottomTabs.tsx` (tab registered as "Feed"; rename to "Discover" if desired). |
| **2. Reusable components needed** | **Existing:** `RecipeCard` (`components/RecipeCard.tsx`) — card with title, meta, Heart/Pin/Pass. **Modals used:** `RecipeDetailModal`, `PassReasonModal`. **Optional to add:** `SectionHeader`, `EmptyState` for consistent styling with design system. |
| **3. Data required** | `Recipe[]` (feed), `passedRecipeIds: string[]`, `selectedRecipeId?: string` for detail modal. From store: recipes, passedRecipeIds; UI state: undo banner, pass-reason modal, feed-stale banner. |
| **4. Existing API/service functions** | `feedStore.getState().fetchFeed()` — calls `mealplanApi.generateMealplan()`. `feedStore.getState().loadFromCache()`. `cookbookStore.getState().heartRecipe(id, recipe)`, `upcomingStore.getState().pinRecipe(id)`, `feedStore.getState().passRecipe(id)`, `uiStore` for undo/pass-reason/offline/feedStale. Cache: `getJson`/`setJson` via `cacheKeys.feed`. |
| **5. Backend endpoints involved** | `POST /api/v1/mealplan/generate` (body optional `{ preferences }`). Returns `{ visible_candidates, candidate_pool_size }`. No other endpoints. |
| **6. User actions** | Pull-to-refresh (refetch feed); tap recipe card → open Recipe Detail modal; Heart → add to Cookbook favorites; Pin → add to Upcoming; Pass → remove from list, show undo bar, open Pass Reason modal; Undo pass; Dismiss undo; Submit/dismiss pass reason; Close detail modal; Tap "Refresh" on feed-stale banner. |
| **7. Implementation status** | **Already implemented.** Screen exists as Feed; logic, API, and modals are wired. Remaining work: align with Figma (layout, typography, colors, tab label "Discover"), and optionally add shared `EmptyState`/`SectionHeader`. |

---

## Screen 2: Recipe Detail

| Item | Details |
|------|--------|
| **1. Target frontend file(s)** | `frontend/src/modals/RecipeDetailModal.tsx`. Invoked from `FeedScreen.tsx` and `CookbookScreen.tsx` (not a standalone tab). |
| **2. Reusable components needed** | **Existing:** Modal layout with ScrollView, inline sections (title, image, “Why this recipe”, ingredients split, instructions, time, servings, tags, action buttons). **Optional:** Extract section blocks into reusable `DetailSection` or use shared `Chip` for tags if Figma uses chips. |
| **3. Data required** | Single `Recipe | null`: id, title, cuisine, totalMinutes, servings, tags, why, ingredientsHave, ingredientsMaybeWant, instructions, photoUri?, leftoverNote?. Passed from parent (Feed or Cookbook); no fetch-by-id. |
| **4. Existing API/service functions** | None for this modal. Parent screens use `feedStore.setSelectedRecipeId` / local `selectedRecipeId` state and pass `recipe` from in-memory list. |
| **5. Backend endpoints involved** | None. Recipe data comes from feed (mealplan generate) or cookbook store. |
| **6. User actions** | Close modal; Heart (add to favorites / toggle in Cookbook context); Pin (add to Upcoming — only when opened from Feed); Pass (only from Feed — remove from feed, show undo, open Pass Reason). |
| **7. Implementation status** | **Already implemented.** All sections A–H from spec are present (title, image, why, ingredients have/maybe want, instructions, time, servings/leftover, tags, Heart/Pin/Pass). Remaining: apply Figma styling and optional component extraction. |

---

## Screen 3: Kitchen Inventory

| Item | Details |
|------|--------|
| **1. Target frontend file(s)** | `frontend/src/screens/InventoryScreen.tsx`, `frontend/src/navigation/BottomTabs.tsx` (tab "Inventory" → can relabel to "Kitchen Inventory"). |
| **2. Reusable components needed** | **Existing:** `InventoryRow` (`components/InventoryRow.tsx`) — name, quantity, location, expiry, Delete. `AddInventoryModal` for add flow. **Optional:** `SectionHeader` for "Expiring Soon", "Fridge", etc.; `EmptyState` for empty list; `Chip` if design uses chips for location/filters. |
| **3. Data required** | `InventoryItem[]` (id, name, quantity, location, expiresOn, expired). Sections built from `expiringSoon(items)` and `byLocation(items)` (Expiring Soon, Fridge, Pantry, Freezer). Store: `inventoryStore` (items, error). |
| **4. Existing API/service functions** | `inventoryApi.getInventory()`, `inventoryApi.addInventory(items)`, `inventoryApi.deleteInventory(itemId)`. Store: `inventoryStore.getState().fetchInventory()`, `loadFromCache()`, `addInventoryItem(name, quantity)`, `deleteInventoryItem(id)`, `clearError()`. Helpers: `expiringSoon`, `byLocation` from `inventoryStore`. Cache: `cacheKeys.inventory`. |
| **5. Backend endpoints involved** | `GET /api/v1/inventory`, `POST /api/v1/inventory` (body `{ items: [{ name, quantity }] }`), `DELETE /api/v1/inventory/{item_id}`. No PATCH (update) yet. |
| **6. User actions** | Open Add modal (+ Add); submit new item (name, quantity) → POST then close modal; delete item (Delete on row) → DELETE; dismiss error banner; pull/cache load on mount. |
| **7. Implementation status** | **Already implemented.** Sections, add, delete, cache, and API are wired. Remaining: Figma styling; optional Staples section (backend has `is_staple`; not yet in frontend types/sections); optional edit flow when PATCH is added. |

---

## Screen 4: My Cookbook

| Item | Details |
|------|--------|
| **1. Target frontend file(s)** | `frontend/src/screens/CookbookScreen.tsx`, `frontend/src/navigation/BottomTabs.tsx` (tab "Cookbook", options.title "My Cookbook"). |
| **2. Reusable components needed** | **Existing:** `CookbookRecipeCard` (list item with optional image, title, tags, Favorite/Cooked), `AddRecipeModal` (entry via "+ Add Recipe"), `RecipeDetailModal` (tap card). **Optional:** `Chip` for filter pills (All / Cooked / Favorites / My Recipes), `SectionHeader`, `EmptyState` for empty filter states. |
| **3. Data required** | `recipesById: Record<string, Recipe>`, `favorites: string[]`, `myRecipeIds: string[]`, `cookedRecipeIds: string[]`. Filter state: `CookbookFilter` ('all' \| 'cooked' \| 'favorites' \| 'my-recipes'). Display list from `cookbookStore.getFilteredRecipes(filter)`. Selected recipe for detail modal from local state. |
| **4. Existing API/service functions** | `cookbookStore`: `getFilteredRecipes(filter)`, `heartRecipe(id, recipe?)`, `unheartRecipe(id)`, `markAsCooked(id)`, `unmarkAsCooked(id)`, `loadFromCache()`. No backend API for cookbook; all persistence via AsyncStorage (`cacheKeys.cookbook`). |
| **5. Backend endpoints involved** | None. Cookbook is client-only (Zustand + cache). |
| **6. User actions** | Switch filter (All, Cooked, Favorites, My Recipes); tap "+ Add Recipe" → open Add Recipe modal; tap recipe card → open Recipe Detail modal; Heart/Unheart (toggle favorite); Mark as Cooked / Unmark; Close modals. |
| **7. Implementation status** | **Already implemented.** Filters, list, modals, and local persistence are in place. Remaining: Figma styling (filters as chips, cards, empty states); optional backend sync if you add a cookbook API later. |

---

## Screen 5: Add Recipe

| Item | Details |
|------|--------|
| **1. Target frontend file(s)** | `frontend/src/modals/AddRecipeModal.tsx`. Opened from `CookbookScreen.tsx` via "+ Add Recipe" button (no dedicated tab). |
| **2. Reusable components needed** | **Existing:** Modal with form fields (title, ingredients, instructions, tags, optional photo), submit/cancel. **Optional:** Shared `TextInput`, `Button`, `Label` from design system for consistency. |
| **3. Data required** | Local form state: title, ingredients (text), instructions (text), tags (text), photoUri. On submit: build `Omit<Recipe, 'id'>` and call `addMyRecipe`; no server payload. |
| **4. Existing API/service functions** | `cookbookStore.getState().addMyRecipe(recipeData)` — generates `my-${Date.now()}` id, merges into recipesById and myRecipeIds, persists via `setJson(cacheKeys.cookbook, ...)`. Image picker: `expo-image-picker` (launchImageLibraryAsync). No backend API. |
| **5. Backend endpoints involved** | None. |
| **6. User actions** | Cancel (close modal, reset form); Pick/change photo (optional); Submit (validate title, parse ingredients/instructions/tags, add to cookbook, close modal). |
| **7. Implementation status** | **Already implemented.** Full form, photo picker, and local add are wired. Remaining: Figma styling; optional backend POST recipe if you add an API later. If design shows Add Recipe as a tab, add a tab that opens this modal or a full-screen wrapper. |

---

## Screen 6: Profile

| Item | Details |
|------|--------|
| **1. Target frontend file(s)** | **Missing.** Add `frontend/src/screens/ProfileScreen.tsx`. Register in `frontend/src/navigation/BottomTabs.tsx` as a new tab (e.g. "Profile"). |
| **2. Reusable components needed** | **To add:** Screen container; typography/list components per Figma. **Optional:** Reuse `SectionHeader`, `EmptyState`; stats cards or list rows from design system. No existing Profile-specific components. |
| **3. Data required** | Depends on design. **Possible from existing client state:** Counts from `cookbookStore` (favorites.length, cookedRecipeIds.length, myRecipeIds.length), optional `feedStore.recipes.length`. **Not yet available:** Preferences, ratings, or server-side stats (no backend). |
| **4. Existing API/service functions** | None for profile. Can read from `cookbookStore.getState()` and `feedStore.getState()` for local stats only. If you add profile/preferences API later: new `profileApi.ts` and optional `profileStore`. |
| **5. Backend endpoints involved** | None currently. Spec mentions GET/PATCH preferences and related concepts; not implemented in backend. |
| **6. User actions** | To be defined from Figma (e.g. view stats, edit preferences, sign out placeholder). For MVP: view-only stats from local state. |
| **7. Implementation status** | **Missing.** No Profile screen, tab, or API. Checklist: create ProfileScreen, add tab in BottomTabs, optionally add theme/store/API when design and backend are defined. |

---

## Summary: Implementation Status by Screen

| Screen | Status | Notes |
|--------|--------|--------|
| Discover | Already implemented | FeedScreen; apply Figma, optionally rename tab to Discover. |
| Recipe Detail | Already implemented | RecipeDetailModal; apply Figma. |
| Kitchen Inventory | Already implemented | InventoryScreen; apply Figma; optional Staples, edit (PATCH). |
| My Cookbook | Already implemented | CookbookScreen; apply Figma. |
| Add Recipe | Already implemented | AddRecipeModal; apply Figma; optional tab wrapper. |
| Profile | Missing | Add ProfileScreen + tab; data from local state or future API. |

---

## Suggested order for applying the checklist

1. **Discover** — Update FeedScreen + RecipeCard + RecipeDetailModal to match Figma; rename tab if desired.
2. **Recipe Detail** — Refine RecipeDetailModal styling and any shared detail components.
3. **Kitchen Inventory** — Update InventoryScreen + InventoryRow + AddInventoryModal to Figma.
4. **My Cookbook** — Update CookbookScreen + CookbookRecipeCard + filter chips to Figma.
5. **Add Recipe** — Update AddRecipeModal to Figma; add tab or entry point if design requires it.
6. **Profile** — Implement ProfileScreen and Profile tab; wire local stats (and later API if added).

No code was modified; this is a mapping and checklist only.
