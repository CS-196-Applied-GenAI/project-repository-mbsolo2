/**
 * Add Recipe form: types, parsing, and validation.
 * Matches Recipe domain model; no backend API for create (cookbook is local).
 */
import type { IngredientResponse, Recipe } from '../types/recipe';

export interface AddRecipeFormValues {
  title: string;
  ingredientsText: string;
  instructionsText: string;
  totalMinutes: number;
  servings: number;
  tagsInput: string;
  photoUri?: string;
}

export interface AddRecipeFormErrors {
  title?: string;
  ingredients?: string;
  instructions?: string;
  totalMinutes?: string;
  servings?: string;
}

/** Parse "amount unit name" or "name" per line. Returns full ingredients and names for ingredientsHave. */
export function parseIngredientLines(text: string): { ingredients: IngredientResponse[]; names: string[] } {
  const lines = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const ingredients: IngredientResponse[] = [];
  const names: string[] = [];
  const amountUnitName = /^(\d+(?:\.\d+)?)\s+(\S+)\s+(.+)$/;
  for (const line of lines) {
    const m = line.match(amountUnitName);
    if (m) {
      const amount = parseFloat(m[1]);
      const unit = m[2];
      const name = m[3].trim();
      ingredients.push({ name, amount, unit });
      names.push(name);
    } else {
      ingredients.push({ name: line, amount: 1, unit: '' });
      names.push(line);
    }
  }
  return { ingredients, names };
}

export function parseInstructions(text: string): string[] {
  return text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseTags(text: string): string[] {
  return text
    .split(/[,;]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Build form values from a Recipe (for edit mode). */
export function recipeToFormValues(recipe: Recipe): AddRecipeFormValues {
  const ingredientsText =
    recipe.ingredients && recipe.ingredients.length > 0
      ? recipe.ingredients
          .map((i) => `${i.amount} ${i.unit} ${i.name}`.replace(/\s+/g, ' ').trim())
          .join('\n')
      : (recipe.ingredientsHave ?? []).join('\n');
  const instructionsText = Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : '';
  return {
    title: recipe.title ?? '',
    ingredientsText,
    instructionsText,
    totalMinutes: recipe.totalMinutes ?? 0,
    servings: recipe.servings ?? 0,
    tagsInput: Array.isArray(recipe.tags) ? recipe.tags.join(', ') : '',
    photoUri: recipe.photoUri,
  };
}

export function validateAddRecipeForm(values: AddRecipeFormValues): AddRecipeFormErrors {
  const errors: AddRecipeFormErrors = {};
  if (!values.title.trim()) {
    errors.title = 'Title is required';
  }
  const hasIngredients = values.ingredientsText.trim().length > 0;
  const hasInstructions = values.instructionsText.trim().length > 0;
  if (!hasIngredients && !hasInstructions) {
    errors.ingredients = 'Add at least one ingredient or one instruction';
    errors.instructions = 'Add at least one ingredient or one instruction';
  }
  if (values.totalMinutes < 0) {
    errors.totalMinutes = 'Must be 0 or more';
  }
  if (values.servings < 0) {
    errors.servings = 'Must be 0 or more';
  }
  return errors;
}
