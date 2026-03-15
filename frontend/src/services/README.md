# Services layer

Domain-oriented API access. **Stores** call services; **screens** use stores only (no direct API or service calls).

## Layout

| Layer | Role |
|-------|------|
| **api/** | Low-level HTTP: `client.ts` (apiFetch), `inventoryApi`, `mealplanApi` |
| **services/** | Domain services that use api/ and expose stable methods |

## Service modules

- **inventoryService** — `getList()`, `addItems()`, `deleteItem()` → api/v1/inventory
- **recipeService** — `getDiscoverRecipes()` → api/v1/mealplan/generate
- **cookbookService** — stubs for saved recipes (no backend yet)
- **profileService** — stubs for profile/preferences (no backend yet)
- **cache** — AsyncStorage getJson/setJson and cacheKeys (unchanged)

## Usage

Stores import from `../services/…` and call service methods. Screens import stores only.
