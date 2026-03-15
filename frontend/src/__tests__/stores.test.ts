import { cookbookStore } from '../store/cookbookStore';
import { feedStore } from '../store/feedStore';
import { inventoryStore } from '../store/inventoryStore';
import { uiStore } from '../store/uiStore';
import { upcomingStore } from '../store/upcomingStore';
import type { Recipe } from '../types/recipe';

jest.mock('../api/inventoryApi', () => ({
  getInventory: jest.fn(),
  addInventory: jest.fn(),
  deleteInventory: jest.fn(),
}));

jest.mock('../api/mealplanApi', () => ({
  generateMealplan: jest.fn(),
}));

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
    jest.clearAllMocks();
  });

  it('initializes with recipes', () => {
    feedStore.getState().setRecipes(sampleRecipes);
    expect(feedStore.getState().recipes).toHaveLength(2);
    expect(feedStore.getState().recipes[0].title).toBe('Pasta');
  });

  it('fetchFeed sets recipes from mealplanApi (15 results)', async () => {
    const { generateMealplan } = require('../api/mealplanApi');
    const fifteenRecipes = Array.from({ length: 15 }, (_, i) => ({
      recipe_id: `meal-${i + 1}`,
      title: `Recipe ${i + 1}`,
      servings: 2,
      ingredients: [{ name: 'ingredient', amount: 1, unit: 'cup' }],
      instructions: ['Step 1'],
    }));
    generateMealplan.mockResolvedValue(fifteenRecipes);

    await feedStore.getState().fetchFeed();

    expect(feedStore.getState().recipes).toHaveLength(15);
    expect(feedStore.getState().recipes[0].id).toBe('meal-1');
    expect(feedStore.getState().recipes[0].title).toBe('Recipe 1');
    expect(feedStore.getState().recipes[14].id).toBe('meal-15');
    expect(generateMealplan).toHaveBeenCalledTimes(1);
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
    cookbookStore.setState({
      recipesById: {},
      favorites: [],
      myRecipeIds: [],
      cookedRecipeIds: [],
    });
  });

  it('can heart and unheart recipes (favorites)', () => {
    cookbookStore.getState().heartRecipe('r1');
    expect(cookbookStore.getState().favorites).toContain('r1');

    cookbookStore.getState().unheartRecipe('r1');
    expect(cookbookStore.getState().favorites).not.toContain('r1');
  });

  it('addMyRecipe adds a recipe and returns id', () => {
    const recipeData: Omit<Recipe, 'id'> = {
      title: 'My Pasta',
      cuisine: 'Italian',
      totalMinutes: 25,
      servings: 2,
      tags: ['quick'],
      why: [],
      ingredientsHave: ['pasta', 'tomato'],
      ingredientsMaybeWant: [],
      instructions: ['Boil water', 'Cook pasta'],
    };
    const id = cookbookStore.getState().addMyRecipe(recipeData);

    expect(id).toMatch(/^my-\d+$/);
    const recipes = cookbookStore.getState().getFilteredRecipes('my-recipes');
    expect(recipes).toHaveLength(1);
    expect(recipes[0].id).toBe(id);
    expect(recipes[0].title).toBe('My Pasta');
    expect(recipes[0].tags).toEqual(['quick']);
    expect(cookbookStore.getState().myRecipeIds).toContain(id);
  });

  it('getFilteredRecipes filters by all, favorites, my-recipes, cooked', () => {
    const r1: Recipe = {
      id: 'r1',
      title: 'Recipe 1',
      cuisine: '',
      totalMinutes: 0,
      servings: 2,
      tags: [],
      why: [],
      ingredientsHave: [],
      ingredientsMaybeWant: [],
      instructions: [],
    };
    const id2 = cookbookStore.getState().addMyRecipe({
      title: 'My Recipe',
      cuisine: '',
      totalMinutes: 0,
      servings: 2,
      tags: [],
      why: [],
      ingredientsHave: [],
      ingredientsMaybeWant: [],
      instructions: [],
    });
    cookbookStore.getState().heartRecipe('r1', r1);

    expect(cookbookStore.getState().getFilteredRecipes('all')).toHaveLength(2);
    expect(cookbookStore.getState().getFilteredRecipes('favorites')).toHaveLength(1);
    expect(cookbookStore.getState().getFilteredRecipes('favorites')[0].id).toBe('r1');
    expect(cookbookStore.getState().getFilteredRecipes('my-recipes')).toHaveLength(1);
    expect(cookbookStore.getState().getFilteredRecipes('my-recipes')[0].id).toBe(id2);

    cookbookStore.getState().markAsCooked('r1');
    expect(cookbookStore.getState().getFilteredRecipes('cooked')).toHaveLength(1);
    expect(cookbookStore.getState().getFilteredRecipes('cooked')[0].id).toBe('r1');
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
    expect(pinned.find((p) => p.recipeId === 'r1')?.bucket).toBe('later');
  });

  it('can unpin a recipe (toggle)', () => {
    upcomingStore.getState().pinRecipe('r1');
    expect(upcomingStore.getState().pinned.some((p) => p.recipeId === 'r1')).toBe(true);
    upcomingStore.getState().unpinRecipe('r1');
    expect(upcomingStore.getState().pinned.some((p) => p.recipeId === 'r1')).toBe(false);
  });
});

describe('inventoryStore', () => {
  beforeEach(() => {
    inventoryStore.setState({ items: [], error: null });
    jest.clearAllMocks();
  });

  it('fetchInventory sets items from API', async () => {
    const mockItems = [
      {
        item_id: 'i1',
        name: 'Milk',
        quantity: 1,
        created_at: '2024-01-01T00:00:00',
        location: 'fridge',
        category: 'dairy',
        storage_guidance: 'Keep cold',
        expiration_date_estimated: '2024-01-08',
        expiration_date_user_override: null,
        expired_flag: false,
      },
    ];
    const { getInventory } = require('../api/inventoryApi');
    getInventory.mockResolvedValue(mockItems);

    await inventoryStore.getState().fetchInventory();

    expect(inventoryStore.getState().items).toHaveLength(1);
    expect(inventoryStore.getState().items[0].name).toBe('Milk');
    expect(inventoryStore.getState().items[0].id).toBe('i1');
    expect(inventoryStore.getState().error).toBeNull();
  });

  it('addInventoryItem adds item via API', async () => {
    const { getInventory, addInventory } = require('../api/inventoryApi');
    getInventory.mockResolvedValue([]);
    await inventoryStore.getState().fetchInventory();

    const added = [
      {
        item_id: 'i2',
        name: 'Bread',
        quantity: 2,
        created_at: '2024-01-01T00:00:00',
        location: 'pantry',
        category: 'grain',
        storage_guidance: 'Keep dry',
        expiration_date_estimated: '2024-01-15',
        expiration_date_user_override: null,
        expired_flag: false,
      },
    ];
    addInventory.mockResolvedValue(added);

    await inventoryStore.getState().addInventoryItem('Bread', 2);

    expect(inventoryStore.getState().items).toHaveLength(1);
    expect(inventoryStore.getState().items[0].name).toBe('Bread');
    expect(inventoryStore.getState().items[0].id).toBe('i2');
  });

  it('deleteInventoryItem removes item via API', async () => {
    const { getInventory, deleteInventory } = require('../api/inventoryApi');
    getInventory.mockResolvedValue([
      {
        item_id: 'i3',
        name: 'Eggs',
        quantity: 6,
        created_at: '2024-01-01T00:00:00',
        location: 'fridge',
        category: 'protein',
        storage_guidance: 'Refrigerate',
        expiration_date_estimated: '2024-01-10',
        expiration_date_user_override: null,
        expired_flag: false,
      },
    ]);
    deleteInventory.mockResolvedValue(undefined);

    await inventoryStore.getState().fetchInventory();
    expect(inventoryStore.getState().items).toHaveLength(1);

    await inventoryStore.getState().deleteInventoryItem('i3');

    expect(deleteInventory).toHaveBeenCalledWith('i3');
    expect(inventoryStore.getState().items).toHaveLength(0);
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
