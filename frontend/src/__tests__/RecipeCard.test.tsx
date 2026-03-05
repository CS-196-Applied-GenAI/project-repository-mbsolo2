import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { RecipeCard } from '../components/RecipeCard';
import type { Recipe } from '../types/recipe';

const sampleRecipe: Recipe = {
  id: '1',
  title: 'Test Pasta',
  cuisine: 'Italian',
  totalMinutes: 25,
  servings: 4,
  tags: [],
  why: [],
  ingredientsHave: [],
  ingredientsMaybeWant: [],
  instructions: [],
};

describe('RecipeCard', () => {
  it('displays the recipe title', () => {
    render(<RecipeCard recipe={sampleRecipe} />);
    expect(screen.getByText('Test Pasta')).toBeOnTheScreen();
  });

  it('shows Heart, Pin, and Pass buttons', () => {
    render(<RecipeCard recipe={sampleRecipe} />);
    expect(screen.getByText('Heart')).toBeOnTheScreen();
    expect(screen.getByText('Pin')).toBeOnTheScreen();
    expect(screen.getByText('Pass')).toBeOnTheScreen();
  });
});
