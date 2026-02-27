from app.schemas.recipe import RecipeCandidate
from app.services.recipe_provider import StubRecipeProvider


def test_stub_recipe_provider_returns_15_recipes() -> None:
    provider = StubRecipeProvider()

    recipes = provider.search_recipes(limit=15)

    assert len(recipes) == 15
    for recipe in recipes:
        assert isinstance(recipe, RecipeCandidate)
        assert recipe.recipe_id
        assert recipe.title
        assert isinstance(recipe.servings, int)
        assert recipe.servings > 0
        assert recipe.ingredients
        for ingredient in recipe.ingredients:
            assert ingredient.name
            assert ingredient.amount is not None
            assert ingredient.unit
        assert recipe.instructions
        for step in recipe.instructions:
            assert step

