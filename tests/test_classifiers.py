from app.services.classifiers import (
    infer_category,
    infer_location,
    infer_storage_guidance,
)


def test_milk_and_oat_milk_classification() -> None:
    assert infer_location("milk") == "fridge"
    assert infer_category("milk") == "dairy"
    assert "Refrigerate" in infer_storage_guidance("milk", "dairy")

    assert infer_location("oat milk") == "fridge"
    assert infer_category("oat milk") == "dairy_alt"
    assert "Refrigerate" in infer_storage_guidance("oat milk", "dairy_alt")


def test_pasta_and_rice_classification() -> None:
    assert infer_location("pasta") == "pantry"
    assert infer_category("pasta") == "grain"
    assert "pantry" in infer_storage_guidance("pasta", "grain").lower()

    assert infer_location("rice") == "pantry"
    assert infer_category("rice") == "grain"
    assert "pantry" in infer_storage_guidance("rice", "grain").lower()


def test_frozen_peas_and_eggs_classification() -> None:
    assert infer_location("frozen peas") == "freezer"
    assert infer_category("frozen peas") in {"produce", "frozen", "unknown"}
    assert "frozen" in infer_storage_guidance("frozen peas", "frozen").lower()

    assert infer_location("eggs") == "fridge"
    assert infer_category("eggs") == "protein"
    assert "Refrigerate" in infer_storage_guidance("eggs", "protein")


def test_tomato_sauce_classification() -> None:
    assert infer_location("tomato sauce") == "pantry"
    assert infer_category("tomato sauce") == "condiment"
    guidance = infer_storage_guidance("tomato sauce", "condiment")
    assert "pantry" in guidance.lower() or "cool, dry place" in guidance.lower()

