# Kitchen Support — Frontend Development Plan (Expo / React Native)

This plan mirrors the backend plan style: small, incremental, testable vertical slices that steadily wire together into a working app.

## 0) Stack (MVP)
- Expo + React Native + **TypeScript**
- React Navigation (bottom tabs)
- Zustand (state)
- AsyncStorage (basic offline cache)
- Fetch (API calls)
- Minimal styling (clean + minimal)

Bottom tabs (final):
**Feed | Upcoming | Inventory | My Cookbook**

Images policy:
- **No stock or AI images**
- Only show images uploaded by the user (primarily in Cookbook; optionally in detail view once uploaded)

---

## 1) UX / Screen Responsibilities (MVP)

### Feed (default landing)
- Scrollable feed (aim for ~15 recipe cards)
- Minimal cards (text-first)
- Actions on each recipe: ❤️ Heart, 📌 Pin, ❌ Pass
- Pass removes from feed; persistent Undo until dismissed
- Tap a card → Recipe Detail modal

### Recipe Detail Modal (from Feed / Cookbook / Upcoming)
Must show:
A) Title + image (if any)
B) “Why this recipe” (logistics only: expiring soon, pantry staples, etc.)
C) Ingredients split: “Already in your kitchen” vs “You may want”
D) Instructions
E) Time estimate
F) Servings + leftover safety indicator
G) Dietary tags (non-prescriptive; spice as tag only)
H) Actions: Heart / Pin / Pass

No “Mark as cooked” from first-time view (MVP). Cooking event tracking can live in Upcoming/Cookbook later.

### Upcoming
- Shows pinned recipes scheduled by backend waste-minimizing logic (MVP can display “Scheduled for X” once backend supports)
- Sections: Today / Tomorrow / Later This Week

### Inventory
- Sections: Expiring Soon, Fridge, Pantry, Freezer, Staples
- Add item (modal): name + quantity
- Remove item (swipe/delete icon)
- Expired items are flagged (warning state), not removed automatically

### My Cookbook
- Hybrid cards:
  - If user photo exists → show it
  - Otherwise minimal card
- Filters: All | Cooked | Favorites | My Recipes
- Supports manual recipe creation (“+ Add Recipe”)
- Hearting a recipe adds it to Cookbook (Favorites)
- Recipes can reappear in Feed later

---

## 2) Frontend Architecture (fast MVP)

### Suggested folder structure
```
src/
  navigation/
    BottomTabs.tsx
  screens/
    FeedScreen.tsx
    UpcomingScreen.tsx
    InventoryScreen.tsx
    CookbookScreen.tsx
  modals/
    RecipeDetailModal.tsx
    AddInventoryModal.tsx
    PassReasonModal.tsx
    AddRecipeModal.tsx
  components/
    RecipeCard.tsx
    InventoryRow.tsx
    Chip.tsx
    SectionHeader.tsx
    EmptyState.tsx
  store/
    feedStore.ts
    inventoryStore.ts
    upcomingStore.ts
    cookbookStore.ts
    uiStore.ts
  api/
    client.ts
    inventoryApi.ts
    mealplanApi.ts
  services/
    cache.ts
    network.ts
  types/
    recipe.ts
    inventory.ts
    cookbook.ts
  utils/
    format.ts
    dates.ts
```

### State boundaries (Zustand)
- `inventoryStore`: items + loading/error + CRUD actions
- `feedStore`: feed recipes + pass/undo state + refresh
- `upcomingStore`: pinned/scheduled recipes
- `cookbookStore`: favorites, cooked, my recipes, photos
- `uiStore`: global banners (offline, new recipes available)

---

## 3) Development Milestones (right-sized)

### Milestone 1 — App shell + navigation
Deliverable:
- Expo app boots
- Bottom tabs render 4 screens with placeholders
- Minimal theme tokens

### Milestone 2 — Feed UI (mock data)
Deliverable:
- RecipeCard component
- Feed shows ~15 mock recipes
- Tap opens Recipe Detail modal with required sections A–H (using mock fields)

### Milestone 3 — Feed interactions (local state)
Deliverable:
- Heart → adds to Cookbook favorites
- Pin → adds to Upcoming
- Pass → removes from feed, persistent Undo, PassReason modal stores contextual feedback locally

### Milestone 4 — Inventory UI (local state)
Deliverable:
- Inventory list grouped by location + Expiring Soon section
- AddInventory modal (name + quantity)
- Remove item
- Expiration warning badges (local mock dates)

### Milestone 5 — Backend integration v1
Deliverable:
- Configure API base URL
- Wire:
  - GET/POST/DELETE inventory
  - POST mealplan/generate (Feed refresh)
- Feed loads from backend on app start and on pull-to-refresh
- Inventory loads from backend and updates UI

### Milestone 6 — Offline cache (AsyncStorage)
Deliverable:
- Cache: inventory, feed, upcoming, cookbook
- On startup: render cached → refresh network → update + re-cache
- Offline banner + graceful failure states

### Milestone 7 — My Cookbook MVP
Deliverable:
- Cookbook screen with hybrid cards + filters
- Manual Add Recipe modal
- Optional: attach local photo URI to a cookbook recipe (no upload yet)

### Milestone 8 — “Smart Upcoming” polish
Deliverable:
- When pinning, show scheduling reason (from backend if available)
- Sections Today/Tomorrow/Later reflect scheduled dates

---

## 4) Right-sized step checklist (implementation order)
1) Create app + bottom tabs
2) Implement Feed with mock recipes
3) Implement Recipe Detail modal (A–H)
4) Add Zustand stores + hook screens to store
5) Implement Heart/Pin/Pass/Undo/Reason (local-only)
6) Implement Upcoming screen (local-only)
7) Implement Inventory screen + Add/Remove (local-only)
8) Add API client + env config
9) Wire Inventory endpoints (GET/POST/DELETE)
10) Wire Feed generation endpoint (POST /mealplan/generate) and show ~15 results
11) Add AsyncStorage cache for inventory + feed
12) Add Cookbook screen + manual recipe + cache
13) Add offline banner + refresh behavior

---

## 5) Testing strategy (fast MVP but meaningful)
Use Jest + React Native Testing Library:
- Store unit tests (Zustand): heart/pin/pass/undo, inventory add/remove
- Component smoke test: RecipeCard renders title + actions
- Optional: one screen render test (Feed renders list)

Goal: tests catch state regressions early without slowing development.
