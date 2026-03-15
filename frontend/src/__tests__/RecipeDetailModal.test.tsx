import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { RecipeDetailModal } from '../modals/RecipeDetailModal';
import type { Recipe } from '../types/recipe';

const sampleRecipe: Recipe = {
  id: '1',
  title: 'Test Recipe',
  cuisine: 'Italian',
  totalMinutes: 25,
  servings: 4,
  tags: ['quick'],
  why: ['Uses tomatoes'],
  ingredientsHave: ['pasta'],
  ingredientsMaybeWant: ['parmesan'],
  instructions: ['Boil pasta', 'Serve'],
};

describe('RecipeDetailModal', () => {
  it('shows "Why this recipe" heading when visible with a recipe', () => {
    render(
      <RecipeDetailModal
        visible={true}
        recipe={sampleRecipe}
        onClose={() => {}}
      />
    );
    expect(screen.getByText('Why this recipe')).toBeOnTheScreen();
  });
});
