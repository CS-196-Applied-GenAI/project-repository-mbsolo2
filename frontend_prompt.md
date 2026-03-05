# Kitchen Support — Frontend Cursor Prompt Pack (Expo / RN, incremental)

These prompts follow the frontend plan in small slices. Each prompt:
1) Adds/updates a test (where reasonable)
2) Implements the minimum code to pass
3) Wires it into the running app (no orphan code)

If your project is moving fast, prioritize **store tests** over heavy UI tests; keep UI tests as smoke checks.

---

## Prompt 1 — Create Expo TypeScript app + baseline Jest setup

```text
Goal: Initialize an Expo + React Native + TypeScript project with a minimal test harness.

Requirements:
- Ensure TypeScript is enabled.
- Add Jest using `jest-expo` and React Native Testing Library.
- Add a single passing test `src/__tests__/smoke.test.ts` that asserts true is true.
- Confirm `npm test` (or `yarn test`) runs and passes.

Constraints:
- Do not add navigation yet.
- Keep configuration minimal and Expo-compatible.

Deliverable:
- App still runs in Expo.
- Tests pass.
```

---

## Prompt 2 — Add Bottom Tab Navigation (Feed | Upcoming | Inventory | My Cookbook)

```text
Goal: Add React Navigation bottom tabs and render 4 placeholder screens.

TDD-ish:
- Add a simple render test `src/__tests__/navigation.test.tsx` that renders <App /> and finds the “Feed” tab label.

Implementation:
- Add React Navigation dependencies for Expo (native stack + bottom tabs).
- Create `src/navigation/BottomTabs.tsx` with 4 tabs:
  - FeedScreen
  - UpcomingScreen
  - InventoryScreen
  - CookbookScreen (label exactly “My Cookbook”)
- Create placeholder screens in `src/screens/*.tsx` that render a header text matching the tab name.

Wiring:
- Update `App.tsx` to include NavigationContainer and BottomTabs.

Deliverable:
- App launches and tabs switch.
- Tests pass.
```

---

## Prompt 3 — Define core types (Recipe, InventoryItem) and mock feed data

```text
Goal: Create TypeScript types and use mock recipes in Feed.

Implementation:
- Create `src/types/recipe.ts` with:
  - Recipe: id, title, cuisine, totalMinutes, servings, tags (string[]), why (string[]),
    ingredientsHave (string[]), ingredientsMaybeWant (string[]), instructions (string[]),
    photoUri? (optional), leftoverNote? (optional)
- Create `src/types/inventory.ts` with:
  - InventoryItem: id, name, quantity, location, expiresOn (ISO string), expired (boolean)
- In FeedScreen, define a `MOCK_RECIPES` array of ~15 recipes (text-first, no images).

UI:
- FeedScreen renders a scrollable list showing recipe titles.

Constraints:
- No stores yet.
- No detail modal yet.

Deliverable:
- Feed tab shows a list of mock recipe titles.
```

---

## Prompt 4 — Build RecipeCard component (minimal card) + smoke test

```text
Goal: Introduce a reusable RecipeCard component used by Feed.

TDD:
- Add `src/__tests__/RecipeCard.test.tsx`:
  - render RecipeCard with a sample recipe
  - assert title appears
  - assert buttons for Heart/Pin/Pass are present (text buttons are fine for MVP)

Implementation:
- Create `src/components/RecipeCard.tsx`:
  - displays title + cuisine + totalMinutes
  - shows 3 action buttons: “Heart”, “Pin”, “Pass”
  - accepts callbacks: onPress, onHeart, onPin, onPass

Wiring:
- FeedScreen uses RecipeCard for each mock recipe.

Deliverable:
- Feed shows clean cards.
- Tests pass.
```

---

## Prompt 5 — Recipe Detail Modal (A–H) and open-on-tap

```text
Goal: Add a modal that opens when a RecipeCard is tapped, showing required sections A–H.

Implementation:
- Create `src/modals/RecipeDetailModal.tsx` that accepts:
  - visible, recipe, onClose, onHeart, onPin, onPass
- Display sections:
  A) Title + image ONLY if recipe.photoUri exists (no stock images)
  B) “Why this recipe” list (logistics only, from recipe.why)
  C) Ingredients split: “Already in your kitchen” vs “You may want”
  D) Instructions
  E) Time estimate
  F) Servings + leftover note
  G) Tags (non-prescriptive)
  H) Action buttons Heart/Pin/Pass

Wiring:
- In FeedScreen, tapping a card sets selectedRecipe and opens modal.

Optional test:
- Render modal with visible=true and assert “Why this recipe” heading exists.

Deliverable:
- Tap card → modal opens → shows sections A–H.
```

---

## Prompt 6 — Add Zustand stores (feed + cookbook + upcoming) with unit tests

```text
Goal: Introduce stores and move feed data from component state into Zustand.

TDD:
- Add `src/__tests__/stores.test.ts` testing:
  - feedStore initializes with recipes
  - cookbookStore can heart/unheart recipes (favorites)
  - upcomingStore can pin a recipe

Implementation:
- Create `src/store/feedStore.ts`
  - state: recipes[], passedRecipeIds (Set or string[]), selectedRecipeId?
  - actions: setRecipes, passRecipe, undoPass
- Create `src/store/cookbookStore.ts`
  - state: favorites (recipe ids or objects), myRecipes[]
  - actions: heartRecipe, unheartRecipe, addMyRecipe
- Create `src/store/upcomingStore.ts`
  - state: pinned[] (recipe ids/objects) with optional scheduledDate
  - actions: pinRecipe

Wiring:
- FeedScreen reads recipes from feedStore.
- Heart/Pin/Pass buttons call store actions.

Deliverable:
- Same UI, but now driven by stores.
- Store tests pass.
```

---

## Prompt 7 — Pass flow: remove from feed + persistent Undo + PassReason modal (contextual)

```text
Goal: Implement Pass behavior:
- Passed recipe disappears immediately from feed
- Show persistent Undo banner/snackbar until dismissed
- PassReason modal captures contextual dislike (not rigid)

Implementation:
- Create `src/modals/PassReasonModal.tsx`:
  - options: ingredient_dislike, dish_type_dislike, too_many_steps, not_in_mood, custom_text
  - capture optional fields: ingredient, dishType, freeText
- Create `src/store/uiStore.ts`:
  - state: undoPassRecipeId?, undoVisible boolean
  - actions: showUndo(recipeId), dismissUndo(), undo()
- On pass:
  - feedStore.passRecipe(recipeId)
  - uiStore.showUndo(recipeId)
  - open PassReasonModal (after pass is OK)
- Undo:
  - uiStore.undo triggers feedStore.undoPass(recipeId)
  - undo remains until dismissed or used

Tests:
- Extend store tests: pass removes from visible list; undo restores.

Deliverable:
- Pass works as designed and is reversible.
```

---

## Prompt 8 — Upcoming screen: display pinned recipes in sections (local scheduling placeholder)

```text
Goal: Upcoming tab shows pinned recipes grouped into Today/Tomorrow/Later.

Implementation:
- In upcomingStore, add `bucket` for MVP: "today" | "tomorrow" | "later"
- When pinning from feed, assign default bucket "later"
- UpcomingScreen renders 3 sections and lists recipes.

Deliverable:
- Pin recipe → appears in Upcoming.
```

---

## Prompt 9 — Inventory screen (local-only): lists + add/remove modals + store tests

```text
Goal: Inventory UI exists even before backend integration.

Implementation:
- Create `src/store/inventoryStore.ts`:
  - state: items[]
  - actions: addLocalItem(name, quantity), removeLocalItem(id)
  - selectors: expiringSoon, byLocation
- Create `src/components/InventoryRow.tsx`
- Create `src/modals/AddInventoryModal.tsx` (name + quantity)
- InventoryScreen:
  - sections: Expiring Soon, Fridge, Pantry, Freezer
  - delete action per row

Tests:
- Add store tests for add/remove.

Deliverable:
- Inventory tab fully functional locally.
```

---

## Prompt 10 — API client + env config (no wiring yet)

```text
Goal: Create a small API client layer (base URL + fetch wrapper) without breaking the app.

Implementation:
- Create `src/api/client.ts`:
  - baseUrl from Expo env (EXPO_PUBLIC_API_BASE_URL)
  - helper `apiFetch(path, options)` that returns JSON and throws on non-2xx
- Create `src/api/inventoryApi.ts`:
  - getInventory()
  - addInventory(items)
  - deleteInventory(itemId)
- Create `src/api/mealplanApi.ts`:
  - generateMealplan() returning a list of recipes (aim for 15)

Deliverable:
- Code compiles; not yet used by screens.
```

---

## Prompt 11 — Wire backend inventory endpoints into Inventory screen (GET/POST/DELETE)

```text
Goal: Replace local inventory mutations with real backend calls, while keeping UI stable.

Implementation:
- inventoryStore:
  - add async actions: fetchInventory(), addInventoryItem(), deleteInventoryItem()
- On InventoryScreen mount: call fetchInventory()
- AddInventoryModal submits to backend via store action
- Delete calls backend via store action

Error handling:
- Show a minimal inline error message or banner.

Tests:
- Store tests mocking inventoryApi functions (jest.mock).

Deliverable:
- Inventory UI is backed by the FastAPI backend.
```

---

## Prompt 12 — Wire backend recipe generation into Feed (POST /mealplan/generate)

```text
Goal: Feed loads real recipe candidates from backend, shows ~15 results.

Implementation:
- feedStore:
  - add async action fetchFeed():
    - calls mealplanApi.generateMealplan()
    - sets recipes
- FeedScreen on mount:
  - call fetchFeed()
- Pull-to-refresh triggers fetchFeed()

Constraints:
- Maintain existing Heart/Pin/Pass behavior.
- Images: only show if recipe.photoUri exists (user uploaded).

Tests:
- Store test mocking mealplanApi to return 15 recipes.

Deliverable:
- Feed is real and scrollable.
```

---

## Prompt 13 — AsyncStorage cache: inventory + feed + cookbook + upcoming (basic offline)

```text
Goal: Basic offline support: show cached data immediately, refresh if online.

Implementation:
- Create `src/services/cache.ts`:
  - getJson(key), setJson(key, value)
- Add store actions:
  - loadFromCache() for feed/inventory/cookbook/upcoming
  - after network fetch, write to cache
- Add offline banner:
  - if fetch fails, keep cached and show “Offline — showing last updated data”

Tests:
- Unit test cache helpers with AsyncStorage mock.

Deliverable:
- Airplane mode still shows last-known feed + inventory.
```

---

## Prompt 14 — My Cookbook screen (hybrid cards) + manual recipe creation

```text
Goal: Implement My Cookbook as the user’s long-term library.

Implementation:
- CookbookScreen:
  - hybrid cards: if photoUri exists show thumbnail, else minimal
  - filters: All | Cooked | Favorites | My Recipes
- AddRecipeModal:
  - title, ingredients (multiline), instructions (multiline), tags
  - optional image picker to attach a local photoUri
- Hearting a recipe adds it to Favorites.

Tests:
- Cookbook store tests for adding my recipe and filtering.

Deliverable:
- Cookbook feels like the app’s “memory.”
```

---

## Prompt 15 — Polish wiring: “New recipes available” refresh banner

```text
Goal: UX polish without big complexity.

Implementation:
- After inventoryStore successfully adds/removes an item, set uiStore.feedStale=true
- FeedScreen shows a subtle banner:
  - “New recipes available” with a [Refresh] button
  - pressing Refresh calls feedStore.fetchFeed() and clears feedStale

Deliverable:
- Inventory changes don’t abruptly reshuffle the feed; user stays in control.
```
