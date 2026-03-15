from __future__ import annotations

from typing import Final


Location = str
Category = str


_LOCATION_KEYWORDS: Final[dict[Location, list[str]]] = {
    "fridge": ["milk", "oat milk", "eggs", "egg"],
    "pantry": ["pasta", "rice", "tomato sauce", "sauce"],
    "freezer": ["frozen", "frozen peas", "peas"],
}

_CATEGORY_KEYWORDS: Final[dict[Category, list[str]]] = {
    "dairy_alt": ["oat milk"],
    "dairy": ["milk"],
    "grain": ["pasta", "rice"],
    "produce": ["peas"],
    "protein": ["eggs", "egg"],
    "condiment": ["tomato sauce", "sauce"],
    "frozen": ["frozen", "frozen peas"],
}


def infer_location(name: str) -> Location:
    lowered = name.lower()
    for location, keywords in _LOCATION_KEYWORDS.items():
        for kw in keywords:
            if kw in lowered:
                return location
    return "unknown"


def infer_category(name: str) -> Category:
    lowered = name.lower()
    for category, keywords in _CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in lowered:
                return category
    return "unknown"


def infer_storage_guidance(name: str, category: str) -> str:
    location = infer_location(name)

    if location == "fridge":
        return "Refrigerate after opening and keep chilled."
    if location == "freezer":
        return "Keep frozen until ready to use."
    if location == "pantry":
        if category == "grain":
            return "Store in a cool, dry pantry."
        if category == "condiment":
            return "Store in a cool, dry place; refrigerate after opening if required."
        return "Store in a cool, dry pantry."

    return "Store appropriately according to package instructions."

