import { cookbookStore } from '../store/cookbookStore';
import { feedStore } from '../store/feedStore';
import { uiStore } from '../store/uiStore';
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

  it('pass removes recipe from visible list; undo restores', () => {
    feedStore.getState().setRecipes(sampleRecipes);
    const state = feedStore.getState();
    const visibleBefore = state.recipes.filter((r) => !state.passedRecipeIds.includes(r.id));
    expect(visibleBefore).toHaveLength(2);

    state.passRecipe('r1');
    const afterPass = feedStore.getState();
    const visibleAfterPass = afterPass.recipes.filter((r) => !afterPass.passedRecipeIds.includes(r.id));
    expect(visibleAfterPass).toHaveLength(1);
    expect(visibleAfterPass[0].id).toBe('r2');

    feedStore.getState().undoPass('r1');
    const afterUndo = feedStore.getState();
    const visibleAfterUndo = afterUndo.recipes.filter((r) => !afterUndo.passedRecipeIds.includes(r.id));
    expect(visibleAfterUndo).toHaveLength(2);
    expect(visibleAfterUndo.map((r) => r.id)).toContain('r1');
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

describe('uiStore', () => {
  beforeEach(() => {
    uiStore.setState({ undoVisible: false, undoPassRecipeId: undefined });
    feedStore.setState({ recipes: [], passedRecipeIds: [] });
  });

  it('showUndo sets undoVisible and undoPassRecipeId; undo calls feedStore.undoPass and dismisses', () => {
    feedStore.getState().setRecipes(sampleRecipes);
    feedStore.getState().passRecipe('r1');
    uiStore.getState().showUndo('r1');

    expect(uiStore.getState().undoVisible).toBe(true);
    expect(uiStore.getState().undoPassRecipeId).toBe('r1');

    uiStore.getState().undo();

    expect(uiStore.getState().undoVisible).toBe(false);
    expect(feedStore.getState().passedRecipeIds).not.toContain('r1');
  });
});
