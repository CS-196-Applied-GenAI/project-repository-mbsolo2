# Shared UI components

Presentational components that use the design system (`../theme`). No API calls or business logic.

## New shared components (Figma redesign)

| Component | Purpose |
|-----------|--------|
| **PrimaryButton** | Primary CTA; sizes: sm, md, lg; disabled and pressed states |
| **SearchBar** | Search input with theme styling; controlled value + onChangeText |
| **SectionHeader** | Section title (e.g. list sections); uses theme sectionHeader padding |
| **TagChip** | Filter/tag pill; optional selected state and onPress |
| **EmptyState** | Empty list message + optional action button |
| **LoadingState** | Spinner + optional message |
| **ScreenContainer** | Full-screen wrapper; optional horizontal padding |
| **CardContainer** | Card wrapper with optional shadow and onPress |

## Existing components

- **RecipeCard** — Feed recipe row (title, meta, Heart/Pin/Pass)
- **CookbookRecipeCard** — Cookbook list item (optional image, Favorite/Cooked)
- **InventoryRow** — Inventory list row (name, quantity, location, expiry, Delete)

## Usage

```tsx
import { PrimaryButton, SectionHeader, EmptyState } from '../components';
// or
import { PrimaryButton } from '../components/PrimaryButton';
```

Screens can adopt these incrementally; existing screens are unchanged until you refactor them.
