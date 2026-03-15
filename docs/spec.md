# Kitchen Support — Backend Specification (MVP)

## 1. Purpose

**Kitchen Support** is a mobile-first (iOS + Android) app for people who feel “lost in the kitchen.” It reduces food waste and increases cooking confidence by:
- Tracking kitchen inventory (fridge/pantry/freezer).
- Estimating expiration dates and highlighting items expiring soon.
- Proposing a weekly meal plan that uses what the user already has.
- Generating and maintaining a **running grocery list** (essential items for the plan, optional upgrades, and staple restocks).
- Learning the user’s preferences over time through **two rating dimensions**: preparation experience and taste.

**Core philosophy:** provide structure and guidance while respecting user autonomy (e.g., never forcing disposal; expired items are flagged and excluded from recommendations, but the user decides what to do).

---

## 2. MVP Scope

### In scope
- Single-user only (no auth).
- Manual inventory add/edit + quick-add via comma-separated input.
- Inventory supports decimal quantities (e.g., `0.75` carton).
- Auto storage-location suggestion and storage guidance.
- Auto-estimated expiration with optional user override.
- Opened/unopened tracking; recipes that use an item mark it opened.
- Weekly planning via **calendar toggles**: per day `None / Lunch / Dinner / Both` (default both every day).
- Dinners planned; lunches typically leftovers.
- Candidate recipes sourced from an external recipe API; backend ranks and presents top 5 at a time.
- User interactively likes/dislikes proposals until they’ve selected enough recipes to cover weekly demand.
- Waste-minimization scoring based on “days until expiration” urgency buckets.
- Leftover safety window based on recipe category (keyword-based).
- Low-inventory detection based on “serving equivalents” table.
- Running grocery list categories: **Essential**, **Recommended upgrades**, **Staple restocks**.
- REST API backend (FastAPI) with synchronous generation.

### Out of scope (MVP)
- Multi-user accounts / household sharing.
- Barcode scanning, receipt OCR, store account imports.
- Real store pricing APIs (MVP uses national averages table).
- Complex nutrition optimization.
- Real-time push notifications (can be added later).

---

## 3. Tech Stack

- **Backend:** Python + FastAPI
- **Database:** SQLite
- **LLM Provider:** OpenAI API via internal wrapper service (`LLMService`)
- **External Recipes:** Recipe API (pluggable interface; initially one provider)
- **Architecture:** REST, synchronous request/response

---

## 4. Domain Concepts

### 4.1 Inventory Items
Inventory is a set of items with quantities and metadata (location, category, expiration, opened status). Items can be staples.

**Key behaviors**
- Location and storage guidance are auto-suggested.
- Expiration is auto-estimated; user can override.
- Items that are expired are flagged and excluded from recommendations, but remain in inventory unless the user removes them.

### 4.2 Meal Planning
Planning is calendar-driven:
- Each day can be set to: `none`, `lunch`, `dinner`, `both`.
- Default for every day is `both`.
- Dinners are planned; lunches are scheduled using leftover rules.
- Plan generation is **interactive**: propose top recipes (max 5 shown), user likes/dislikes until enough meals are covered.

### 4.3 Leftovers
Leftovers are tracked in terms of servings and safety window. Safety window depends on category.

**Safety windows (lower-bound conservative)**
- Seafood → 2 days
- Poultry → 3 days
- Red meat → 3 days
- Vegetarian (no dairy) → 4 days
- Dairy-heavy → 3 days
- Cooked rice/grains → 3 days
- Cooked pasta → 3 days
- Soup/stew → 4 days

Category is assigned by deterministic keyword rules (see §9).

### 4.4 Preferences and Learning
Two rating dimensions, 1–5 stars:
- **Process rating**: difficulty/comfort/time
- **Taste rating**: final result enjoyment

Ratings are prompted immediately after “Mark as Cooked” but **optional**.

Preference learning is rule-based:
- 3 stars is neutral.
- Update steps: 5★ = +2, 4★ = +1, 3★ = 0, 2★ = −1, 1★ = −2.

Ingredient learning uses **potency tiers** so flavor drivers matter more than bulk.

---

## 5. Data Model (SQLite)

> The app is single-user MVP. A `user` table is optional; for extensibility, we include a singleton `app_state` record.

### 5.1 Tables

#### `inventory_items`
| field | type | required | notes |
|---|---|---:|---|
| item_id | TEXT (UUID) | ✅ | primary key |
| name | TEXT | ✅ | raw user name or canonicalized name |
| quantity | REAL | ✅ | decimal quantity |
| created_at | TEXT (ISO8601) | ✅ | |
| location | TEXT | ✅ | `fridge` \| `pantry` \| `freezer` \| `unknown` |
| storage_guidance | TEXT | ✅ | e.g., “refrigerate after opening” |
| category | TEXT | ✅ | e.g., `dairy`, `produce`, `grain`, `protein`, `condiment` |
| is_staple | INTEGER | ✅ | 0/1 |
| opened | INTEGER | ✅ | 0/1 |
| expiration_date_estimated | TEXT (ISO8601) | ✅ | nullable if unknown? (MVP prefers always present) |
| expiration_date_user_override | TEXT (ISO8601) | ✅ | nullable allowed |
| expired_flag | INTEGER | ✅ | 0/1 derived (stored for fast querying) |

Optional fields (not required by product spec but may be added):
- `last_updated_at`, `opened_at`, `notes`, `source`

#### `recipes`
Stores recipe data from API (and any adapted/pivoted version if persisted).

| field | type | required | notes |
|---|---|---:|---|
| recipe_id | TEXT | ✅ | primary key (API id or generated) |
| title | TEXT | ✅ | |
| ingredient_json | TEXT | ✅ | JSON array: `{name, amount, unit}` |
| servings | INTEGER | ✅ | |
| cuisine_type | TEXT | ✅ | |
| equipment_required_json | TEXT | ✅ | JSON array of strings |
| category | TEXT | ✅ | leftover safety category |
| instructions_json | TEXT | ✅ | JSON array of steps |
| source | TEXT | ✅ | API/provider |
| prep_time_minutes | INTEGER | ❌ | optional |
| spice_level | TEXT | ❌ | optional |
| estimated_cost | REAL | ❌ | optional |
| calories_per_serving | REAL | ❌ | optional |
| image_url | TEXT | ❌ | optional |

#### `meal_plans`
Stores the current and historical plans.

| field | type | required | notes |
|---|---|---:|---|
| plan_id | TEXT | ✅ | primary key |
| created_at | TEXT | ✅ | |
| start_date | TEXT | ✅ | week start date |
| calendar_json | TEXT | ✅ | per day toggles |
| selected_recipes_json | TEXT | ✅ | selected recipe ids + assigned days |
| leftovers_json | TEXT | ✅ | leftover servings per recipe and expiration dates |
| status | TEXT | ✅ | `draft` \| `confirmed` |

#### `grocery_list_items`
Running list (persistent), with association to current plan when relevant.

| field | type | required | notes |
|---|---|---:|---|
| grocery_id | TEXT | ✅ | primary key |
| name | TEXT | ✅ | |
| quantity | REAL | ✅ | approximate |
| unit | TEXT | ✅ | optional, often `item` |
| category | TEXT | ✅ | `essential` \| `upgrade` \| `staple_restock` |
| priority | INTEGER | ✅ | higher = more important |
| estimated_price | REAL | ✅ | national average |
| in_current_plan | INTEGER | ✅ | 0/1 |
| purchased | INTEGER | ✅ | 0/1 |
| created_at | TEXT | ✅ | |
| last_updated_at | TEXT | ✅ | |

#### `preferences`
Singleton record.

| field | type | required | notes |
|---|---|---:|---|
| pref_id | TEXT | ✅ | use `singleton` |
| cuisine_likes_json | TEXT | ✅ | list |
| cuisine_dislikes_json | TEXT | ✅ | list |
| dietary_restrictions_json | TEXT | ✅ | list |
| spice_tolerance | TEXT | ✅ | e.g., `mild`, `medium`, `hot` |
| equipment_constraints_json | TEXT | ✅ | list of available equipment |
| staples_json | TEXT | ✅ | list of staples names |
| grocery_budget_weekly | REAL | ❌ | optional |
| max_new_ingredients_weekly | INTEGER | ❌ | optional |

#### `ratings`
| field | type | required | notes |
|---|---|---:|---|
| rating_id | TEXT | ✅ | |
| recipe_id | TEXT | ✅ | |
| created_at | TEXT | ✅ | |
| process_rating | INTEGER | ✅ | 1–5 |
| taste_rating | INTEGER | ✅ | 1–5 |

#### `preference_weights`
Stores learned weights.

| field | type | required | notes |
|---|---|---:|---|
| key | TEXT | ✅ | e.g., `cuisine:indian`, `ingredient:mushroom`, `equipment:oven` |
| weight | REAL | ✅ | starts at 0 |

---

## 6. REST API

Base URL: `/api/v1`

### 6.1 Inventory

#### `GET /inventory`
Returns all items, including `expired_flag` and warnings.

Response (200):
```json
{
  "items": [
    {
      "item_id": "uuid",
      "name": "Chobani Oat Milk",
      "quantity": 0.75,
      "location": "fridge",
      "storage_guidance": "Refrigerate after opening.",
      "category": "dairy_alt",
      "is_staple": false,
      "opened": true,
      "expiration_date_estimated": "2026-03-10",
      "expiration_date_user_override": null,
      "expired_flag": false
    }
  ]
}
```

#### `POST /inventory`
Add item(s). Supports manual add and quick-add list.

Request:
```json
{
  "items": [
    {"name": "DeCecco Rigatoni", "quantity": 3},
    {"name": "avocado", "quantity": 4}
  ]
}
```

Behavior:
- Canonicalize name (best-effort).
- Auto-assign `location`, `storage_guidance`, `category`.
- Auto-estimate expiration dates.
- Default `opened=false` (unless classified as “open by default”).

#### `PATCH /inventory/{item_id}`
Update fields: `name`, `quantity`, `location`, `opened`, `expiration_date_user_override`, `is_staple`.

#### `DELETE /inventory/{item_id}`
Remove item.

---

### 6.2 Preferences

#### `GET /preferences`
Returns onboarding preferences and staples.

#### `PATCH /preferences`
Update cuisines, restrictions, spice tolerance, equipment constraints, staples, and optionally weekly budget or max new ingredients.

---

### 6.3 Meal Planning

#### `POST /mealplan/generate`
Synchronous. Creates or replaces a **draft** meal plan for a given week and calendar needs.

Request:
```json
{
  "week_start_date": "2026-03-02",
  "mode": "balanced",
  "calendar": {
    "mon": "both",
    "tue": "both",
    "wed": "both",
    "thu": "lunch",
    "fri": "both",
    "sat": "both",
    "sun": "both"
  },
  "budget": 20.0,
  "max_new_ingredients": null
}
```

Response (200):
- Returns up to **15 candidate recipes** ranked overall, but includes only top **5** in `visible_candidates`.
- Includes `coverage_target` (meals required) and `coverage_current` (initially 0).

```json
{
  "plan_id": "uuid",
  "status": "draft",
  "coverage_target_meals": 12,
  "coverage_current_meals": 0,
  "visible_candidates": [/* top 5 recipes */],
  "candidate_pool_size": 15
}
```

#### `POST /mealplan/select`
User likes/dislikes proposals and accumulates selected recipes.

Request:
```json
{
  "plan_id": "uuid",
  "recipe_id": "api_123",
  "action": "like"
}
```

Behavior:
- On `like`, add recipe to `selected_recipes_json` and update coverage estimate based on servings/leftovers.
- When user still needs more meals, backend returns next best candidates (up to 5 visible).
- On `dislike`, mark that recipe as rejected for this plan.

Response:
```json
{
  "coverage_target_meals": 12,
  "coverage_current_meals": 7,
  "visible_candidates": [/* next top 5 */],
  "selected": [/* selected recipes summary */]
}
```

#### `POST /mealplan/confirm`
Finalizes the plan:
- Assigns selected recipes to days consistent with calendar needs and leftover safety windows.
- Computes leftovers schedule.
- Generates/updates running grocery list for essential items + upgrades + restocks.
- Sets `status=confirmed`.

Request:
```json
{"plan_id":"uuid"}
```

#### `GET /mealplan/current`
Returns the most recent plan (draft or confirmed) and schedule.

---

### 6.4 Cooking + Ratings

#### `POST /recipes/{recipe_id}/mark-cooked`
Behavior:
- Decrement inventory quantities by recipe usage (heuristic conversion).
- Mark used items as `opened=true`.
- If quantity falls below low-inventory serving-equivalent threshold, add staple restock or essential suggestion.
- Create a “pending rating” state (client will prompt immediately; backend does not require it).

Request:
```json
{"plan_id":"uuid", "cooked_at":"2026-03-03T19:10:00-06:00"}
```

Response includes updated inventory and optional “rate now” reminder payload.

#### `POST /recipes/{recipe_id}/rate`
Stores two ratings.

Request:
```json
{
  "process_rating": 4,
  "taste_rating": 5
}
```

Behavior:
- Apply preference updates (see §8).

---

### 6.5 Grocery List

#### `GET /grocery-list`
Returns running list with categories and priorities.

#### `POST /grocery-list/mark-purchased`
Request:
```json
{"grocery_id":"uuid","purchased":true}
```

Behavior:
- If purchased, optionally offer “Add to inventory” workflow in client; backend can support a follow-up `POST /inventory`.

---

## 7. Meal Plan Generation Logic

### 7.1 Candidate Pool Creation (15 recipes)
MVP approach:
1. Query external recipe API for ~15 recipes relevant to:
   - user cuisine preferences (onboarding)
   - dietary restrictions
   - spice tolerance (soft filter)
   - equipment constraints (hard filter)
2. For each recipe, adapt/substitute as needed to align with inventory and reduce new items (LLM may be used for adaptation if needed).

### 7.2 Waste-first Ranking (Hierarchical)
Ranking approach: **filter constraints → rank by WasteScore → break ties with Taste/Process alignment**.

1. **Filter** out recipes requiring expired items.
2. **Compute WasteScore** (see §7.3).
3. Sort recipes by:
   1) WasteScore (desc)
   2) Preference match score (desc)
   3) Grocery delta (asc)
   4) Stable tiebreaker (title)

### 7.3 WasteScore (Urgency Buckets)
For each recipe ingredient that matches an inventory item:
- Let `days_until_expiration` be computed from the effective expiration date (override if present, else estimated).
- Assign points:
  - 0–1 days → 5
  - 2–3 days → 3
  - 4–7 days → 1
  - 8+ days → 0
- WasteScore = sum(points across all matched (non-expired) items used by the recipe)

**Expired items**
- If an inventory item is expired (`days_until_expiration < 0`), the recipe is not recommended (filtered out).

---

## 8. Preference Learning Engine

### 8.1 Rating Steps
Map star rating to delta:
- 5★ → +2
- 4★ → +1
- 3★ → 0
- 2★ → −1
- 1★ → −2

### 8.2 Taste Updates
On taste rating delta `Δt`:
- Update cuisine weight: `weight[cuisine:<cuisine_type>] += Δt`
- Update ingredient weights with potency scaling (see §8.4).

### 8.3 Process Updates
On process rating delta `Δp`:
- If `Δp < 0`: down-rank recipes requiring equipment that tends to correlate with low process satisfaction (simple heuristic), and/or increase penalty for longer prep time if available.
- If `Δp > 0`: increase tolerance for complexity similarly.
MVP stores:
- `weight[equipment:<x>]` adjustments
- Optional `weight[complexity]` scalar

### 8.4 Ingredient Potency Tiers
Three tiers:
- **High potency:** sauces/pastes/condiments, spices/seasonings, aromatics (garlic/onion/ginger), chiles, strong flavors (mushrooms, olives, anchovy), cheeses
- **Medium potency:** proteins, most vegetables, broths
- **Low potency:** starch bases (rice/pasta/bread), neutral fats (oil), water

**Linear scaling for taste updates**
Given `Δt`:
- High potency → `+Δt`
- Medium potency → `+Δt/2` (implemented as integer rounding toward 0, i.e., +1 for Δt=+2, −1 for Δt=−2)
- Low potency → 0

---

## 9. Deterministic Classification Rules

### 9.1 Storage Location + Guidance
A rule-based classifier maps item name/category to:
- `location`: fridge/pantry/freezer
- `storage_guidance`: short text

Examples:
- Milk, yogurt → fridge; “Refrigerate; keep sealed.”
- Pasta, rice → pantry; “Store dry in cool place.”
- Frozen vegetables → freezer.

### 9.2 Leftover Safety Category (Keyword Rules)
Category assignment uses ingredient/title keywords:
- Seafood: shrimp, salmon, tuna, cod, crab, scallop
- Poultry: chicken, turkey
- Red meat: beef, pork, lamb
- Dairy-heavy: cream, alfredo, cheese sauce, heavy cream
- Cooked pasta: pasta, spaghetti, rigatoni, penne
- Cooked rice/grains: rice, quinoa, barley
- Soup/stew: soup, stew, chili, broth-based
- Vegetarian: no meat/seafood keywords and not dairy-heavy

---

## 10. Inventory Updates from Recipes

### 10.1 Quantity Decrement
- Inventory decrements based on recipe usage.
- Backend uses heuristic conversions from recipe units (cups/oz/grams) into “fraction of package” for items tracked by container units.

Examples:
- User has `1.0` carton milk; recipe uses 2 cups → decrement by approx 0.25 carton (heuristic).
- User has 4 avocados; recipe uses 2 → decrement by 2.

### 10.2 Opened Tracking
- If a recipe uses an item, mark `opened=true`.
- Opened/unopened affects expiration estimation (MVP can apply shorter shelf-life after first use for relevant categories).

---

## 11. Expiration Handling

### 11.1 Effective expiration date
`effective_expiration = expiration_date_user_override if present else expiration_date_estimated`

### 11.2 Expired behavior
- If effective expiration is in the past:
  - set `expired_flag=true`
  - exclude from recipe recommendations
  - keep in inventory; user may delete manually

---

## 12. Low Inventory Detection

Low-inventory is triggered when remaining quantity is below **1 serving equivalent** for that category.

### Serving-equivalent defaults (confirmed)
- Milk / plant milk → 1 cup
- Pasta (dry) → 2 oz
- Rice (dry) → 1/2 cup
- Sauce (tomato, pesto, curry paste, etc.) → 1/2 cup
- Cheese (shredded) → 1/2 cup
- Leafy greens → 2 cups raw
- Root vegetables (sweet potato, potato) → 1 medium unit
- Eggs → 1 egg
- Meat / poultry → 4 oz
- Mushrooms → 1 cup

Implementation detail:
- Because inventory is stored in “package units,” the backend uses a mapping from package→serving for common items or a fallback heuristic.
- If uncertain, be conservative and avoid aggressive restock triggers.

---

## 13. Grocery List

### 13.1 Categories
- **Essential**: needed to execute current confirmed plan (but phrased as “essential” not “required”)
- **Recommended upgrades**: optional improvements (e.g., fresh herbs, garnish)
- **Staple restocks**: staples falling below serving threshold or user marked “out”

### 13.2 Pricing (MVP)
Uses rough national average price table keyed by category/item type.
- Budget constraint uses estimated prices.

### 13.3 Running List Behavior
- Grocery list persists across weeks.
- Items linked to current plan have `in_current_plan=1`.
- Essential items are highlighted via higher `priority`.

---

## 14. Plan Consistency When Inventory Changes

If inventory changes after plan generation but before confirmation:
- System only re-optimizes if a **core ingredient** becomes unavailable.
- Non-core ingredient shortages do not trigger regeneration.

### 14.1 Core Ingredient Detection (Rule-based)
Ingredient is **core** if:
- It is a primary protein (protein keyword list), OR
- Appears in recipe title, OR
- Exceeds a quantity threshold relative to the recipe’s ingredient list (heuristic)

### 14.2 Pivot Behavior (LLM “Similar Recipe”)
If a core ingredient becomes unavailable, backend requests a pivot recipe from LLM.

**Hard constraint:** preserve approximate servings/leftover yield.

**Soft preferences (ranking):**
1) Dish type similarity (highest)
2) High-potency ingredient overlap
3) Cuisine similarity

---

## 15. LLM Integration Contract

### 15.1 LLMService Interface
All LLM calls go through a single service layer with prompt versioning.

Methods:
- `adapt_recipe_to_inventory(api_recipe, inventory, preferences, mode, budget)-> adapted_recipe_json`
- `generate_similar_recipe(missing_core_ingredient, base_recipe, inventory, preferences, servings)-> recipe_json`

### 15.2 Required Output Format (JSON)
LLM must return valid JSON matching schema:

```json
{
  "title": "string",
  "servings": 4,
  "dish_type": "curry|soup|pasta|salad|stir_fry|other",
  "cuisine_guess": "indian",
  "ingredients": [
    {"name":"tomato sauce", "amount":1, "unit":"cup", "optional":false}
  ],
  "instructions": ["Step 1...", "Step 2..."],
  "notes": "optional",
  "prompt_version": "v1"
}
```

Backend validates:
- JSON parseable
- `servings` present
- ingredient list non-empty
- instructions non-empty

If validation fails, fallback to API recipe without adaptation or return an error with actionable message.

---

## 16. Error Handling & Timeouts

- All synchronous generation endpoints must have strict timeouts.
- If recipe API fails: return 503 with retry guidance.
- If LLM fails: fallback behavior is used where possible; otherwise return 500 with error code.
- Validation errors return 400 with details.

---

## 17. Security & Privacy (MVP)
- No authentication (single-user MVP).
- Do not log full prompts with user inventory in plaintext in production settings; in MVP, limited logging acceptable.
- Store API keys in environment variables.

---

## 18. Future Extensions (Non-MVP)
- Multi-user auth + household sharing.
- Store-specific pricing APIs.
- Barcode/receipt scanning.
- Nutrition and macro-aware planning.
- Notifications for expiring soon items.
- More robust unit conversions and package-size modeling.

---

## 19. Implementation Notes (FastAPI)
- Use Pydantic models for request/response schemas.
- Use SQLite with SQLAlchemy (or equivalent) + migrations.
- Create modules:
  - `api/routers/*`
  - `services/recipe_provider.py`
  - `services/llm_service.py`
  - `services/planning_engine.py`
  - `services/scoring.py`
  - `services/preference_engine.py`
  - `services/classifiers.py` (location/category/leftovers/core ingredient)
  - `db/models.py`

---

## 20. Acceptance Criteria (MVP)
1. User can add inventory items manually and via quick-add list.
2. System auto-assigns location, category, storage guidance, and estimated expiration.
3. Expired items are flagged and excluded from recommendations.
4. User can set weekly calendar needs (none/lunch/dinner/both).
5. Backend generates 15 candidates and shows top 5; user can like/dislike to select enough recipes.
6. Confirming a plan schedules dinners and leftovers within safety windows.
7. Grocery list persists and categorizes items (essential/upgrades/restocks), with estimated prices and priorities.
8. Marking a recipe cooked decrements inventory quantities and marks used items opened.
9. Optional ratings (process + taste) update weights; future rankings shift accordingly.
10. If a core ingredient becomes unavailable before confirmation, backend pivots using LLM similar-recipe logic.

