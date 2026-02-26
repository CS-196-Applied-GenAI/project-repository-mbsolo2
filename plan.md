# Kitchen Support — Backend Build Blueprint (FastAPI + SQLite)

This plan is derived from the project specification, including the inventory schema, REST endpoints, meal plan generation approach, and expiration rules. fileciteturn1file1L18-L34 fileciteturn1file3L35-L88 fileciteturn1file4L64-L73

## 0) Guiding principles for the build
- **Ship vertical slices**: each iteration delivers a usable API behavior end-to-end (router → service → DB → tests).
- **Test-first for safety**: every slice has unit tests for pure logic + API tests for endpoints.
- **Keep external dependencies swappable**: recipe provider and LLM are interfaces with stubs first.

---

## 1) High-level backend architecture (what to build)

### 1.1 Directory layout (recommended)
```
backend/
  app/
    main.py
    api/
      routers/
        inventory.py
        recipes.py
        mealplan.py
      deps.py
    core/
      config.py
      logging.py
    db/
      engine.py
      models.py
      session.py
      migrations/   # optional for MVP; Alembic later
    schemas/
      inventory.py
      recipe.py
      mealplan.py
      common.py
    services/
      inventory_service.py
      expiration_service.py
      classifiers.py
      recipe_provider.py
      recipe_service.py
      mealplan_service.py
      scoring.py
    tests/
      conftest.py
      test_inventory_api.py
      test_expiration_service.py
      test_recipe_generation_api.py
      test_recipe_provider_stub.py
  pyproject.toml
  README.md
```

### 1.2 Core components
**DB Layer**
- SQLAlchemy models for `inventory_items` (plus minimal needed tables for recipe generation MVP as placeholders). fileciteturn1file0L11-L25

**Services**
- `InventoryService`: add/remove/update items; calls classifier + expiration estimation.
- `ExpirationService`: computes effective expiration + expired_flag updates. fileciteturn1file4L66-L73
- `RecipeProvider`: interface; MVP stub returns deterministic sample recipes; later integrate real API.
- `RecipeService`: “recipe generation” orchestration (pull candidates → filter expired items → compute WasteScore → rank). fileciteturn1file2L66-L99
- `Scoring`: WasteScore urgency buckets (0–1:5, 2–3:3, 4–7:1, 8+:0). fileciteturn1file2L88-L96

**API Routers**
- Inventory endpoints:
  - `GET /api/v1/inventory`
  - `POST /api/v1/inventory`
  - `DELETE /api/v1/inventory/{item_id}` fileciteturn1file3L41-L88
- Recipe generation endpoint (priority function):
  - `POST /api/v1/mealplan/generate` (in MVP, return visible candidates only; plan persistence can come later) fileciteturn1file3L102-L105
- Expiration check:
  - implemented as part of `GET /inventory` (always returns `expired_flag`) and as a maintenance service call.

---

## 2) Implementation blueprint (step-by-step build order)

### Step A — Project skeleton + test harness
1. Create FastAPI app with `/health`.
2. Add pytest, httpx test client, and a `conftest.py` to create an app + test DB.
3. Configure settings via env vars (DB path, recipe provider mode).

Deliverable: can run `pytest` and a trivial endpoint test.

---

### Step B — Database models + session management
1. Implement SQLAlchemy engine/session for SQLite.
2. Implement `inventory_items` model exactly as spec fields (including `expired_flag`). fileciteturn1file0L11-L25
3. Create DB init function for tests/dev (create_all on startup in MVP).
4. Add repository helpers (CRUD functions or a small repository class).

Deliverable: unit test creates an item, reads it, deletes it.

---

### Step C — Classifiers + expiration estimation (logic layer first)
1. `classifiers.py`
   - `infer_location(name) -> location`
   - `infer_category(name) -> category`
   - `infer_storage_guidance(name, category) -> text` fileciteturn1file4L25-L33
2. `expiration_service.py`
   - `estimate_expiration(created_at, category, opened) -> date`
   - `effective_expiration(estimated, override) -> date` fileciteturn1file4L66-L68
   - `is_expired(effective_expiration, now) -> bool` fileciteturn1file4L69-L73
3. Tests for each:
   - known foods map to expected locations/categories
   - override beats estimate
   - expired_flag flips when past date

Deliverable: pure logic fully tested; no endpoints yet.

---

### Step D — Inventory endpoints (add/remove + expiration check)
1. `POST /inventory`
   - Accept list of items `{name, quantity}`.
   - For each item: normalize name, infer location/category/guidance, estimate expiration, set opened=false, expired_flag computed.
2. `GET /inventory`
   - Returns full list including `expired_flag` (this is the “check expiration dates” feature surfaced via read).
3. `DELETE /inventory/{item_id}`
   - Deletes item.
4. Tests:
   - add then list includes item
   - delete removes item
   - expired items appear with `expired_flag=true` and are still returned

Deliverable: prioritized functions #2, #3, #4 working.

---

### Step E — Recipe provider (stub first)
1. Define `RecipeProvider` protocol:
   - `search_recipes(preferences, limit=15) -> list[RecipeCandidate]`
2. Implement `StubRecipeProvider` returning 15 deterministic recipes with ingredients/units/servings.
3. Tests:
   - returns exactly 15
   - schema is valid

Deliverable: deterministic recipe pool without external API.

---

### Step F — WasteScore + filtering by expiration (core of recipe generation)
1. Implement `scoring.py`
   - `urgency_points(days_until_exp)`: buckets 0–1=5, 2–3=3, 4–7=1, else 0 fileciteturn1file2L88-L96
   - `waste_score(recipe, inventory_items, now) -> int`
     - match recipe ingredient names to inventory item names (MVP fuzzy contains match)
     - ignore expired items; if recipe *requires* an expired item, treat as ineligible (filter out) fileciteturn1file2L98-L99
2. Tests:
   - items expiring sooner contribute higher score
   - expired ingredient causes recipe to be filtered

Deliverable: fully tested scoring/filtering.

---

### Step G — Recipe generation endpoint (priority function #1)
1. Implement `POST /mealplan/generate` minimal behavior:
   - Load inventory
   - Load preferences (for MVP, allow passing minimal preferences in request or store singleton later)
   - Call provider for 15 candidates
   - Filter ineligible (expired required ingredients)
   - Rank by WasteScore (desc) and return top 5 in `visible_candidates` and `candidate_pool_size=15` fileciteturn1file2L66-L96
2. API tests:
   - with empty inventory: returns 5 candidates (WasteScore likely 0)
   - with expiring items: recipes using them float to the top
   - with expired item: recipe requiring it is not returned

Deliverable: “recipe generation” shipped end-to-end.

---

### Step H — Hardening + developer ergonomics
1. Input validation and error responses (400 for malformed, 500 for provider failures).
2. Add logging and request IDs.
3. Add OpenAPI tags and example payloads.

---

## 3) Iteration 1 — Chunk the build into small, iterative milestones

### Milestone 1: Inventory CRUD + expiration flags (vertical slice)
- DB model + session
- Classifiers + expiration estimation
- POST/GET/DELETE inventory endpoints
- Tests (API + unit)

### Milestone 2: Deterministic recipe generation (vertical slice)
- RecipeProvider stub
- WasteScore computation + expired filtering
- POST /mealplan/generate endpoint
- Tests

### Milestone 3: Replace stub with real recipe API (integration slice)
- Implement real provider behind interface
- Add contract tests and fallback behavior
- Keep all existing tests passing (stub tests remain)

---

## 4) Iteration 2 — Break each milestone into smaller chunks

### Milestone 1 (Inventory + expiration) → chunks
1.1 Create app skeleton + test runner
1.2 Add SQLite engine/session + create_all
1.3 Implement `inventory_items` SQLAlchemy model
1.4 Implement `classifiers` (location/category/guidance)
1.5 Implement `expiration_service` (estimate + override + expired)
1.6 Implement `InventoryService.add_items()`
1.7 Implement `POST /inventory` + API test
1.8 Implement `GET /inventory` + API test (includes expired_flag)
1.9 Implement `DELETE /inventory/{id}` + API test

### Milestone 2 (Recipe generation) → chunks
2.1 Define recipe schema + provider interface
2.2 Implement StubRecipeProvider returning 15 recipes
2.3 Implement ingredient→inventory matching helper
2.4 Implement urgency bucket function + unit tests
2.5 Implement waste_score() + unit tests
2.6 Implement filter_ineligible_recipes() + unit tests
2.7 Implement `POST /mealplan/generate` + API tests

### Milestone 3 (Real provider) → chunks
3.1 Add provider config selection (stub vs real)
3.2 Implement real provider client (requests/httpx)
3.3 Map provider response → internal RecipeCandidate schema
3.4 Add integration tests (mock HTTP) + rate limit/backoff
3.5 Add failure fallback (return stub or 503)

---

## 5) Iteration 3 — Break chunks into “right-sized” implementation steps
These are intended to be: (a) safe with strong testing, (b) small enough to complete without breaking everything, (c) meaningful progress.

### Milestone 1, Chunk 1.1 → Steps
- Create `app/main.py` with FastAPI + `/health`
- Create `tests/test_health.py` using TestClient
- Ensure `pytest` passes

### Chunk 1.2 → Steps
- Add `db/engine.py` (SQLite URL from env)
- Add `db/session.py` (SessionLocal)
- Add test fixture that creates temp SQLite file per test run
- Test: can open a session and execute `SELECT 1`

### Chunk 1.3 → Steps
- Implement `InventoryItem` ORM model with required fields and types fileciteturn1file0L11-L25
- Add `db/models.py` import and `Base.metadata.create_all()` in test setup
- Test: insert one InventoryItem and query it back

### Chunk 1.4 → Steps
- Implement `classifiers.infer_location()` with a minimal keyword map
- Implement `classifiers.infer_category()` similarly
- Implement `classifiers.infer_storage_guidance()` for key categories fileciteturn1file4L25-L33
- Unit tests for 6–10 sample items (milk, pasta, frozen veg, etc.)

### Chunk 1.5 → Steps
- Implement `expiration_service.effective_expiration()` (override wins) fileciteturn1file4L66-L68
- Implement `expiration_service.is_expired()` fileciteturn1file4L69-L73
- Implement `expiration_service.estimate_expiration()` with simple category shelf-life table
- Unit tests for: estimate exists, override works, expired logic works

### Chunk 1.6 → Steps
- Implement `InventoryService.add_items(items)`:
  - generate UUID
  - set created_at now
  - classifier fields
  - estimate expiration + expired_flag
- Unit test: service returns created items with fields filled

### Chunk 1.7 → Steps
- Create Pydantic schemas: `InventoryCreateItem`, `InventoryCreateRequest`, `InventoryItemOut`
- Implement router `POST /api/v1/inventory`
- API test: post 2 items → 200 → returned items have UUIDs and inferred fields

### Chunk 1.8 → Steps
- Implement router `GET /api/v1/inventory`
- API test: after POST, GET returns list including expired_flag field fileciteturn1file3L41-L63
- Add an “expired item” test by forcing override date in the past via PATCH or direct DB insert

### Chunk 1.9 → Steps
- Implement router `DELETE /api/v1/inventory/{item_id}`
- API test: delete then GET doesn’t include it

---

### Milestone 2, Chunk 2.1 → Steps
- Create Pydantic recipe schemas: `Ingredient`, `RecipeCandidate`
- Add a minimal `Preferences` schema (for now can be passed in request)

### Chunk 2.2 → Steps
- Implement `StubRecipeProvider.search_recipes(limit=15)` returning 15 candidates
- Unit test: count=15, fields non-empty

### Chunk 2.3 → Steps
- Implement `match_inventory(ingredient_name, inventory_items)` using:
  - lowercase
  - contains / token overlap
- Unit tests for matching: “oat milk” ↔ “Chobani Oat Milk”; “rigatoni” ↔ “DeCecco Rigatoni”

### Chunk 2.4 → Steps
- Implement `urgency_points(days)` bucket function fileciteturn1file2L91-L96
- Unit tests: days=0→5, 2→3, 5→1, 10→0

### Chunk 2.5 → Steps
- Implement `waste_score(recipe, inventory, now)`:
  - for each ingredient → match inventory
  - if matched item expired → mark “uses expired” for filter
  - else sum urgency points
- Unit test: recipe using expiring avocado gets higher score

### Chunk 2.6 → Steps
- Implement `filter_ineligible(recipes, inventory, now)`:
  - remove recipes that use any expired matched item fileciteturn1file2L98-L99
- Unit test: expired milk removes milk-based recipe

### Chunk 2.7 → Steps
- Implement `POST /api/v1/mealplan/generate`:
  - get inventory from DB
  - provider returns 15
  - score + filter
  - sort by score desc
  - return `{visible_candidates: top5, candidate_pool_size: 15}`
- API tests:
  - ordering changes when expiration dates change
  - returns at most 5 visible

---

## 6) Final “right-sized” checklist (what you implement first)
If you want the safest path that still moves fast, do these in order:

1) Health endpoint + test  
2) SQLite session + test  
3) InventoryItem model CRUD unit test  
4) Classifiers unit tests  
5) ExpirationService unit tests  
6) POST inventory API test  
7) GET inventory API test (expiration included)  
8) DELETE inventory API test  
9) StubRecipeProvider unit test  
10) WasteScore unit tests  
11) Mealplan generate API tests  

After step 11, you have the 4 priority functions working with strong test coverage.

