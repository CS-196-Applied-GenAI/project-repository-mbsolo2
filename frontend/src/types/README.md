# Frontend types

Centralized types aligned with backend API contracts. Backend schemas live in `app/schemas/`.

| File | Backend source | Notes |
|------|----------------|--------|
| **inventory.ts** | `app.schemas.inventory` | InventoryItemResponse = InventoryItemOut; request types for POST. |
| **recipe.ts** | `app.schemas.recipe`, `app.schemas.mealplan` | RecipeCandidateResponse = RecipeCandidate; Recipe is domain (some fields frontend-only). |
| **cookbook.ts** | None yet | Stub types for future saved-recipes API. |
| **profile.ts** | None yet | Stub types for future profile/preferences API. |

Use `import type { ... } from '../types'` or from the specific file. API and services import from here.
