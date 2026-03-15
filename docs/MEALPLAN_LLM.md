# Mealplan LLM Recipe Generation

The mealplan generation endpoint (`POST /api/v1/mealplan/generate`) can use an LLM to generate recipe candidates when configured. Otherwise it uses hardcoded stub recipes.

## Required environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MEALPLAN_LLM_ENABLED` | No | Set to `true`, `1`, or `yes` to enable LLM generation. Default: disabled. |
| `OPENAI_API_KEY` | When using LLM | Your OpenAI API key. If unset and LLM is enabled, the app falls back to stub recipes. |
| `MEALPLAN_LLM_MODEL` | No | Model name (e.g. `gpt-4o-mini`, `gpt-4o`). Default: `gpt-4o-mini`. |

## Optional dependency

Install the LLM extra so the OpenAI client is available:

```bash
pip install -e ".[llm]"
```

If the `openai` package is not installed, the service will fall back to stub recipes and log a warning.

## How fallback works

1. **No LLM config** – If `MEALPLAN_LLM_ENABLED` is not set or false, or `OPENAI_API_KEY` is missing, the app uses `StubRecipeProvider` only (15 hardcoded recipes).

2. **LLM configured** – If enabled and API key is set, the app uses `LLMRecipeProvider`, which calls the LLM to generate recipes. The provider receives a short inventory summary (item names) when available.

3. **LLM failure** – If the LLM call fails (network error, rate limit, invalid response, or missing `openai` package), `LLMRecipeProvider` falls back to `StubRecipeProvider` for that request. The API still returns 200 and recipe candidates.

4. **Invalid LLM response** – If the model returns JSON that does not match the expected schema, the parser returns no recipes and the provider uses the stub fallback.

The existing scoring and ranking logic (inventory-based eligibility and waste score) is unchanged; only the source of recipe candidates changes.

## How to verify the app is using the LLM

1. **Environment** – Set `MEALPLAN_LLM_ENABLED=true` and `OPENAI_API_KEY` to a valid key. Restart the backend.

2. **Logs** – When the LLM successfully returns recipes, the app logs:  
   `LLM generated N recipe(s) for mealplan`.  
   If the LLM is skipped or fails, you may see:  
   `LLM recipe provider falling back to stub provider` or  
   `LLM recipe generation failed: ...`.

3. **Response content** – Stub recipes have `recipe_id` values like `stub-1`, `stub-2`, and generic titles (“Stub Recipe 1”, …). LLM-generated recipes have `recipe_id` values like `llm-1` (or whatever the model returns) and varied titles and ingredients.

4. **Disable and compare** – Set `MEALPLAN_LLM_ENABLED=false` (or unset it) and call `POST /api/v1/mealplan/generate` again; you should see only stub recipes and no LLM log line.
