import { cookbookStore } from '../store/cookbookStore';
import { feedStore } from '../store/feedStore';
import { upcomingStore } from '../store/upcomingStore';
import type { Recipe } from '../types/recipe';

const sampleRecipes: Recipe[] = [
  {
    id: 'r1',
    title: 'Pasta',
    cuisine: 'Italian',
    totalMinutes: 20,
    servings: 2,
    tags: [],
    why: [],
    ingredientsHave: [],
    ingredientsMaybeWant: [],
    instructions: [],
  },
  {
    id: 'r2',
    title: 'Smoothie',
    cuisine: 'American',
    totalMinutes: 5,
    servings: 1,
    tags: [],
    why: [],
    ingredientsHave: [],
    ingredientsMaybeWant: [],
    instructions: [],
  },
];

describe('feedStore', () => {
  beforeEach(() => {
    feedStore.setState({ recipes: [], passedRecipeIds: [] });
  });

  it('initializes with recipes', () => {
    feedStore.getState().setRecipes(sampleRecipes);
    expect(feedStore.getState().recipes).toHaveLength(2);
    expect(feedStore.getState().recipes[0].title).toBe('Pasta');
  });
});

describe('cookbookStore', () => {
  beforeEach(() => {
    cookbookStore.setState({ favorites: [] });
  });

  it('can heart and unheart recipes (favorites)', () => {
    cookbookStore.getState().heartRecipe('r1');
    expect(cookbookStore.getState().favorites).toContain('r1');

    cookbookStore.getState().unheartRecipe('r1');
    expect(cookbookStore.getState().favorites).not.toContain('r1');
  });
});

describe('upcomingStore', () => {
  beforeEach(() => {
    upcomingStore.setState({ pinned: [] });
  });

  it('can pin a recipe', () => {
    upcomingStore.getState().pinRecipe('r1');
    const pinned = upcomingStore.getState().pinned;
    expect(pinned.some((p) => p.recipeId === 'r1')).toBe(true);
  });
});
