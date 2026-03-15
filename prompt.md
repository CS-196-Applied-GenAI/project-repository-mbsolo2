# Kitchen Support — Cursor Prompt Pack (TDD, incremental)

These prompts implement the backend plan step-by-step in a test-driven manner, in the same order as the “right-sized checklist” and detailed chunks in `plan.md`. fileciteturn2file0L229-L254  
**Workflow expectation:** For each prompt, Cursor should (1) write/adjust tests first, (2) implement the minimum code to pass, (3) run `pytest`, and (4) avoid large refactors.

---

## Prompt 1 — Create FastAPI app skeleton + `/health` test

```text
You are implementing the Kitchen Support backend (FastAPI + SQLite) in a new repo.

Goal: create the minimal FastAPI app with a /health endpoint, plus a passing pytest test.

Requirements:
- Create `app/main.py` that exposes `app = FastAPI()` and includes a GET `/health` route returning JSON `{ "status": "ok" }`.
- Create `app/__init__.py` (if needed) so imports work cleanly.
- Create `tests/test_health.py` using FastAPI TestClient. It should:
  - import `app` from `app.main`
  - call GET `/health`
  - assert status code 200 and response json equals `{ "status": "ok" }`
- Add minimal packaging so `pytest` can discover modules (e.g., `pyproject.toml` or `pytest.ini` if needed). Keep it minimal.

Deliverable:
- `pytest -q` passes with the single health test.

Do not add unrelated endpoints or database code yet.
```

---

## Prompt 2 — Add SQLite engine/session + DB test fixture and “SELECT 1” test

```text
Goal: introduce a SQLite SQLAlchemy engine + session factory and a test fixture that uses a temporary SQLite database per test run.

TDD steps:
1) Add a new test `tests/test_db_session.py` that:
   - imports SessionLocal (or get_session) from `app.db.session`
   - opens a session and executes `SELECT 1`
   - asserts the result equals 1

Implementation requirements:
- Create `app/db/engine.py`:
  - read DB URL from an env var `DATABASE_URL` (default to `sqlite:///./dev.db`)
  - create SQLAlchemy engine (ensure sqlite connect args for check_same_thread=False)
- Create `app/db/session.py`:
  - SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
  - Provide `get_db()` generator dependency for FastAPI later (yield session, close finally)
- Create `tests/conftest.py`:
  - fixture that sets `DATABASE_URL` to a temp sqlite file (or sqlite:///:memory: with correct engine config)
  - ensures engine/session uses that DB for tests
  - if you choose file-based temp DB, ensure cleanup

Constraints:
- Keep production code minimal; no ORM models yet.
- Make sure the engine/session is created AFTER env var is set in tests (important). If needed, implement lazy engine creation or a function to create engine from settings.

Deliverable:
- `pytest -q` passes health + db session test.
```

---

## Prompt 3 — Implement InventoryItem ORM model + CRUD unit test

```text
Goal: add SQLAlchemy ORM model for inventory_items and prove basic CRUD works via unit test.

TDD:
- Create `tests/test_inventory_model_crud.py`:
  - create a session
  - insert one InventoryItem with required fields filled
  - commit + query it back
  - delete it + confirm it is gone

Implementation:
- Create `app/db/models.py` with:
  - Base = declarative_base()
  - InventoryItem ORM model with fields:
    - item_id (str primary key)
    - name (str)
    - quantity (float)
    - created_at (datetime or ISO string; choose datetime in DB and serialize later)
    - location (str)
    - storage_guidance (str)
    - category (str)
    - is_staple (bool/int)
    - opened (bool/int)
    - expiration_date_estimated (date/datetime)
    - expiration_date_user_override (nullable date/datetime)
    - expired_flag (bool/int)
- Ensure SQLite types are compatible (use Boolean/Integer, Date/DateTime as you prefer).
- Ensure tables are created for tests:
  - Add a helper `init_db()` that calls Base.metadata.create_all(bind=engine)
  - In `tests/conftest.py`, call init_db() before tests run (e.g., session-scoped fixture).

Constraints:
- Keep scope strictly to InventoryItem model + CRUD test.
- Do not implement classifiers or endpoints yet.

Deliverable:
- All tests pass.
```

---

## Prompt 4 — Implement classifiers (location/category/guidance) + unit tests

```text
Goal: implement deterministic classifiers:
- infer_location(name) -> fridge/pantry/freezer/unknown
- infer_category(name) -> category string
- infer_storage_guidance(name, category) -> short guidance text

TDD:
- Create `tests/test_classifiers.py` with 8–10 representative items:
  - milk/oat milk -> fridge, dairy_alt, "Refrigerate..." guidance
  - pasta -> pantry, grain, guidance
  - rice -> pantry, grain, guidance
  - frozen peas -> freezer, produce or frozen, guidance
  - eggs -> fridge, protein, guidance
  - tomato sauce -> pantry, condiment, guidance
- Assert exact outputs for location and category; guidance can be asserted by substring match.

Implementation:
- Create `app/services/classifiers.py` with a small keyword map (lowercased matching).
- Make functions pure and deterministic.
- Do not query DB inside classifiers.

Deliverable:
- Tests pass and classifiers are ready to be called by InventoryService later.
```

---

## Prompt 5 — Implement ExpirationService (estimate + override + expired) + unit tests

```text
Goal: implement expiration estimation and expired detection.

TDD:
- Create `tests/test_expiration_service.py` covering:
  1) effective_expiration: override date wins over estimated
  2) is_expired: returns true when effective date < now (use fixed datetime in tests)
  3) estimate_expiration: returns a non-null date based on category and opened flag

Implementation:
- Create `app/services/expiration_service.py` with functions:
  - estimate_expiration(created_at: datetime, category: str, opened: bool) -> date (or datetime)
    - use a simple conservative shelf-life mapping by category for MVP (e.g., dairy shorter when opened, pantry items longer)
  - effective_expiration(estimated, override) -> chosen date
  - is_expired(effective_expiration, now) -> bool
- Keep estimation simple but deterministic; tests should lock expected behavior.

Deliverable:
- Unit tests pass and the service has no FastAPI dependencies.
```

---

## Prompt 6 — Implement InventoryService.add_items() + unit test

```text
Goal: implement InventoryService to add items into DB with inferred fields and expiration flags.

TDD:
- Create `tests/test_inventory_service_add.py`:
  - create a session
  - call InventoryService.add_items with 2 items: name+quantity
  - assert returned items:
    - have item_id set
    - have created_at set
    - have location/category/guidance set based on classifiers
    - have expiration_date_estimated set
    - have expired_flag computed correctly (should be False for fresh items)

Implementation:
- Create `app/services/inventory_service.py`:
  - class InventoryService(session)
  - method add_items(items: list[dict]) -> list[InventoryItem]
    - generate UUID for item_id
    - set opened=False by default
    - set is_staple=False by default
    - call classifiers + expiration_service
    - compute expired_flag using is_expired(effective_expiration)
    - persist and commit
- Keep it minimal (only add_items). No endpoints yet.

Deliverable:
- All tests pass.
```

---

## Prompt 7 — Implement POST /api/v1/inventory endpoint + API test

```text
Goal: create REST endpoint POST /api/v1/inventory to add items.

TDD:
- Create `tests/test_inventory_api_post.py` using TestClient:
  - POST to /api/v1/inventory with JSON:
    { "items": [ { "name": "avocado", "quantity": 4 }, { "name": "oat milk", "quantity": 1 } ] }
  - Assert 200 and response includes items with:
    - item_id present
    - inferred location/category present
    - quantity matches
    - expired_flag present

Implementation:
- Create Pydantic schemas in `app/schemas/inventory.py`:
  - InventoryCreateItem(name: str, quantity: float)
  - InventoryCreateRequest(items: list[InventoryCreateItem])
  - InventoryItemOut(...fields used in response)
- Add `app/api/routers/inventory.py`:
  - APIRouter(prefix="/api/v1/inventory")
  - POST route that:
    - uses db dependency `get_db()`
    - calls InventoryService.add_items
    - returns serialized items
- Wire router in `app/main.py` (include_router).

Constraints:
- Do not implement GET or DELETE yet.
- Ensure test DB dependency works with TestClient (use the existing conftest fixture; override dependency if needed).

Deliverable:
- pytest passes including the new API test.
```

---

## Prompt 8 — Implement GET /api/v1/inventory endpoint + expiration visibility test

```text
Goal: implement GET /api/v1/inventory returning all items, including expired_flag.

TDD:
- Create `tests/test_inventory_api_get.py`:
  - POST an item via API
  - GET /api/v1/inventory
  - Assert the posted item is present with correct fields

Also add an expired test:
- Insert an item where expiration_date_user_override is in the past.
- Then GET /inventory should show expired_flag=true for that item.

Implementation:
- Add GET route to `app/api/routers/inventory.py`:
  - queries all InventoryItem rows
  - returns list serialized using InventoryItemOut
- To support expired test cleanly, add InventoryService method (or direct DB set in test) to set override date.
  - Keep it minimal: tests can insert via ORM directly if simplest.

Deliverable:
- pytest passes; “check expiration dates” is implemented via GET.
```

---

## Prompt 9 — Implement DELETE /api/v1/inventory/{item_id} endpoint + API test

```text
Goal: implement remove from inventory.

TDD:
- Create `tests/test_inventory_api_delete.py`:
  - POST an item
  - DELETE /api/v1/inventory/{item_id}
  - GET inventory and assert it is removed

Implementation:
- Add DELETE route to `app/api/routers/inventory.py`
- Implement InventoryService.delete_item(item_id) (or direct DB delete in router, but prefer service)
- Return 204 No Content or 200 with a small payload; choose one and lock in tests.

Deliverable:
- pytest passes. Priority functions add/remove/check-expiration are complete.
```

---

## Prompt 10 — Implement Recipe schemas + StubRecipeProvider + unit test

```text
Goal: introduce recipe generation data structures and a deterministic provider stub.

TDD:
- Create `tests/test_recipe_provider_stub.py`:
  - instantiate StubRecipeProvider
  - call search_recipes(limit=15)
  - assert list length is 15
  - assert each recipe has: recipe_id, title, servings, ingredients list non-empty, instructions non-empty

Implementation:
- Create `app/schemas/recipe.py`:
  - Ingredient(name: str, amount: float|int, unit: str)
  - RecipeCandidate(recipe_id: str, title: str, servings: int, ingredients: list[Ingredient], instructions: list[str])
  - (Optional fields can be omitted for MVP)
- Create `app/services/recipe_provider.py`:
  - Protocol/ABC RecipeProvider with search_recipes(preferences, limit=15)
  - StubRecipeProvider returns deterministic recipes (hardcoded list) and truncates to limit.
- Keep preferences argument optional or accept dict; keep it simple.

Deliverable:
- pytest passes with new unit test.
```

---

## Prompt 11 — Implement scoring (urgency buckets + matching + waste_score + filtering) + unit tests

```text
Goal: implement WasteScore and expired filtering.

TDD:
- Create `tests/test_scoring.py` with:
  1) urgency_points bucket mapping:
     - days 0,1 => 5; 2,3 => 3; 4..7 => 1; 8+ => 0
  2) match_inventory helper:
     - ingredient "oat milk" matches inventory "Chobani Oat Milk"
  3) waste_score increases when using items expiring sooner
  4) filter_ineligible removes recipes that match expired inventory items

Implementation:
- Create `app/services/scoring.py`:
  - urgency_points(days: int) -> int
  - match_inventory(ingredient_name: str, items: list[InventoryItem]) -> InventoryItem|None
    - simple lowercased substring/token overlap
  - waste_score(recipe: RecipeCandidate, inventory_items, now) -> int
  - filter_ineligible(recipes, inventory_items, now) -> list[RecipeCandidate]
    - if recipe matches any expired inventory item => filtered out

Notes:
- Use InventoryItem effective expiration: override if present else estimated (use ExpirationService effective_expiration).
- Keep matching deterministic.

Deliverable:
- pytest passes.
```

---

## Prompt 12 — Implement POST /api/v1/mealplan/generate endpoint + API tests

```text
Goal: implement the recipe generation endpoint end-to-end.

TDD:
- Create `tests/test_mealplan_generate_api.py`:
  1) With empty inventory:
     - POST /api/v1/mealplan/generate
     - assert 200
     - response has candidate_pool_size=15
     - visible_candidates length <= 5
  2) With expiring inventory items:
     - insert an inventory item with override expiration in 1 day
     - ensure at least one stub recipe includes an ingredient name that matches it
     - assert that recipe appears in visible_candidates and ranks high (top 1–2)
  3) With expired inventory item:
     - set override expiration in past
     - ensure a stub recipe matches it
     - assert that recipe is NOT returned

Implementation:
- Create `app/api/routers/mealplan.py`:
  - POST /api/v1/mealplan/generate
- Create a minimal request/response schema in `app/schemas/mealplan.py`:
  - request can be empty for MVP or include a minimal preferences dict
  - response should include:
    - visible_candidates (top 5)
    - candidate_pool_size (15)
- Implement `app/services/recipe_service.py` or `mealplan_service.py`:
  - load inventory from DB
  - call provider.search_recipes(limit=15)
  - filter_ineligible + compute waste_score
  - sort by score desc
  - return top 5

Wiring:
- Include the mealplan router in `app/main.py`.
- Provider should be constructed in a simple way (e.g., StubRecipeProvider for now). Keep it injectable later but don’t over-engineer.

Deliverable:
- pytest passes. All 4 priority functions are now implemented and tested:
  - add inventory
  - remove inventory
  - check expiration dates
  - recipe generation
```

---

## Prompt 13 — Hardening pass (validation + error handling) without breaking tests

```text
Goal: improve robustness without changing core behavior.

Add:
- Request validation errors return 422 (FastAPI default) or a consistent 400 with details (choose and keep consistent).
- Graceful provider failures:
  - if provider throws, return 503 with JSON { "error": "recipe_provider_unavailable" }
- Add OpenAPI tags for inventory and mealplan routes.
- Add minimal logging (request id optional).

Tests:
- Add a test that simulates provider failure (monkeypatch StubRecipeProvider.search_recipes to raise) and asserts 503.

Constraints:
- Do not refactor architecture significantly.
- Keep all previous tests passing.
```
