import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import { RecipeCard } from '../components/RecipeCard';
import { PassReasonModal } from '../modals/PassReasonModal';
import { RecipeDetailModal } from '../modals/RecipeDetailModal';
import { cookbookStore } from '../store/cookbookStore';
import { feedStore } from '../store/feedStore';
import { uiStore } from '../store/uiStore';
import { upcomingStore } from '../store/upcomingStore';
import type { Recipe } from '../types/recipe';

export const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Pasta with Tomato Basil Sauce',
    cuisine: 'Italian',
    totalMinutes: 25,
    servings: 4,
    tags: ['quick', 'vegetarian'],
    why: ['Uses ripe tomatoes'],
    ingredientsHave: ['pasta', 'tomatoes', 'basil', 'garlic', 'olive oil'],
    ingredientsMaybeWant: ['parmesan', 'red pepper flakes'],
    instructions: ['Boil pasta', 'Make sauce', 'Toss and serve'],
  },
  {
    id: '2',
    title: 'Oat Milk Smoothie',
    cuisine: 'American',
    totalMinutes: 5,
    servings: 1,
    tags: ['breakfast', 'quick'],
    why: ['Uses oat milk'],
    ingredientsHave: ['oat milk', 'banana', 'spinach'],
    ingredientsMaybeWant: ['honey', 'chia seeds'],
    instructions: ['Add ingredients to blender', 'Blend until smooth'],
  },
  {
    id: '3',
    title: 'Rice and Beans Bowl',
    cuisine: 'Latin',
    totalMinutes: 35,
    servings: 2,
    tags: ['vegan', 'hearty'],
    why: ['Uses rice and black beans'],
    ingredientsHave: ['rice', 'black beans', 'onion', 'cumin'],
    ingredientsMaybeWant: ['avocado', 'lime', 'cilantro'],
    instructions: ['Cook rice', 'Warm beans with spices', 'Assemble bowl'],
  },
  {
    id: '4',
    title: 'Scrambled Eggs with Herbs',
    cuisine: 'American',
    totalMinutes: 10,
    servings: 2,
    tags: ['breakfast', 'quick'],
    why: ['Uses eggs'],
    ingredientsHave: ['eggs', 'butter', 'chives'],
    ingredientsMaybeWant: ['cream', 'parsley'],
    instructions: ['Whisk eggs', 'Scramble in pan', 'Garnish with herbs'],
  },
  {
    id: '5',
    title: 'Lentil Soup',
    cuisine: 'Mediterranean',
    totalMinutes: 45,
    servings: 6,
    tags: ['soup', 'vegan'],
    why: ['Uses lentils and vegetables'],
    ingredientsHave: ['lentils', 'carrots', 'celery', 'onion', 'vegetable broth'],
    ingredientsMaybeWant: ['lemon', 'parsley'],
    instructions: ['Sauté vegetables', 'Add lentils and broth', 'Simmer until tender'],
  },
  {
    id: '6',
    title: 'Grilled Cheese Sandwich',
    cuisine: 'American',
    totalMinutes: 10,
    servings: 1,
    tags: ['quick', 'comfort'],
    why: ['Uses bread and cheese'],
    ingredientsHave: ['bread', 'cheddar cheese', 'butter'],
    ingredientsMaybeWant: ['tomato'],
    instructions: ['Butter bread', 'Add cheese', 'Grill until golden'],
  },
  {
    id: '7',
    title: 'Stir-Fried Vegetables',
    cuisine: 'Asian',
    totalMinutes: 20,
    servings: 2,
    tags: ['vegan', 'quick'],
    why: ['Uses seasonal vegetables'],
    ingredientsHave: ['broccoli', 'bell pepper', 'soy sauce', 'ginger', 'garlic'],
    ingredientsMaybeWant: ['sesame oil', 'rice'],
    instructions: ['Heat wok', 'Stir-fry vegetables', 'Add sauce and serve'],
  },
  {
    id: '8',
    title: 'Oatmeal with Fruit',
    cuisine: 'American',
    totalMinutes: 15,
    servings: 1,
    tags: ['breakfast', 'healthy'],
    why: ['Uses oats and fruit'],
    ingredientsHave: ['oats', 'banana', 'cinnamon'],
    ingredientsMaybeWant: ['milk', 'honey', 'berries'],
    instructions: ['Cook oats', 'Top with fruit and cinnamon'],
  },
  {
    id: '9',
    title: 'Tomato Cucumber Salad',
    cuisine: 'Mediterranean',
    totalMinutes: 15,
    servings: 4,
    tags: ['salad', 'no-cook'],
    why: ['Uses tomatoes and cucumber'],
    ingredientsHave: ['tomatoes', 'cucumber', 'red onion', 'olive oil', 'vinegar'],
    ingredientsMaybeWant: ['feta', 'herbs'],
    instructions: ['Chop vegetables', 'Toss with oil and vinegar', 'Season to taste'],
  },
  {
    id: '10',
    title: 'Bean Tacos',
    cuisine: 'Mexican',
    totalMinutes: 25,
    servings: 4,
    tags: ['vegan', 'quick'],
    why: ['Uses black beans'],
    ingredientsHave: ['black beans', 'tortillas', 'lime', 'cilantro'],
    ingredientsMaybeWant: ['avocado', 'salsa', 'onion'],
    instructions: ['Warm beans', 'Heat tortillas', 'Assemble tacos'],
  },
  {
    id: '11',
    title: 'Mushroom Risotto',
    cuisine: 'Italian',
    totalMinutes: 40,
    servings: 2,
    tags: ['vegetarian', 'comfort'],
    why: ['Uses rice and mushrooms'],
    ingredientsHave: ['arborio rice', 'mushrooms', 'onion', 'white wine', 'broth'],
    ingredientsMaybeWant: ['parmesan', 'parsley'],
    instructions: ['Sauté mushrooms', 'Add rice and wine', 'Stir in broth until creamy'],
  },
  {
    id: '12',
    title: 'Peanut Butter Banana Toast',
    cuisine: 'American',
    totalMinutes: 5,
    servings: 1,
    tags: ['breakfast', 'quick'],
    why: ['Uses bread and banana'],
    ingredientsHave: ['bread', 'peanut butter', 'banana'],
    ingredientsMaybeWant: ['honey'],
    instructions: ['Toast bread', 'Spread peanut butter', 'Add banana slices'],
  },
  {
    id: '13',
    title: 'Chickpea Curry',
    cuisine: 'Indian',
    totalMinutes: 35,
    servings: 4,
    tags: ['vegan', 'hearty'],
    why: ['Uses chickpeas and spices'],
    ingredientsHave: ['chickpeas', 'coconut milk', 'curry powder', 'onion', 'tomato'],
    ingredientsMaybeWant: ['rice', 'cilantro'],
    instructions: ['Sauté onion and spices', 'Add chickpeas and coconut milk', 'Simmer and serve'],
  },
  {
    id: '14',
    title: 'Garlic Bread',
    cuisine: 'Italian',
    totalMinutes: 15,
    servings: 4,
    tags: ['side', 'quick'],
    why: ['Uses bread and garlic'],
    ingredientsHave: ['bread', 'garlic', 'butter', 'parsley'],
    ingredientsMaybeWant: ['parmesan'],
    instructions: ['Mix butter and garlic', 'Spread on bread', 'Toast until golden'],
  },
  {
    id: '15',
    title: 'Vegetable Frittata',
    cuisine: 'Mediterranean',
    totalMinutes: 35,
    servings: 4,
    tags: ['breakfast', 'vegetarian'],
    why: ['Uses eggs and vegetables'],
    ingredientsHave: ['eggs', 'bell pepper', 'zucchini', 'onion', 'cheese'],
    ingredientsMaybeWant: ['herbs'],
    instructions: ['Sauté vegetables', 'Add beaten eggs', 'Bake until set'],
  },
];

export default function FeedScreen() {
  const recipes = feedStore((s) => s.recipes);
  const passedRecipeIds = feedStore((s) => s.passedRecipeIds);
  const selectedRecipeId = feedStore((s) => s.selectedRecipeId);
  const setRecipes = feedStore.getState().setRecipes;
  const setSelectedRecipeId = feedStore.getState().setSelectedRecipeId;
  const passRecipe = feedStore.getState().passRecipe;
  const heartRecipe = cookbookStore.getState().heartRecipe;
  const pinRecipe = upcomingStore.getState().pinRecipe;

  const undoVisible = uiStore((s) => s.undoVisible);
  const undoPassRecipeId = uiStore((s) => s.undoPassRecipeId);
  const showUndo = uiStore.getState().showUndo;
  const dismissUndo = uiStore.getState().dismissUndo;
  const undo = uiStore.getState().undo;
  const passReasonVisible = uiStore((s) => s.passReasonVisible);
  const passReasonRecipeId = uiStore((s) => s.passReasonRecipeId);
  const showPassReasonModal = uiStore.getState().showPassReasonModal;
  const dismissPassReasonModal = uiStore.getState().dismissPassReasonModal;

  useEffect(() => {
    if (recipes.length === 0) {
      setRecipes(MOCK_RECIPES);
    }
  }, [recipes.length, setRecipes]);

  const handlePass = (recipeId: string) => {
    setSelectedRecipeId(undefined);
    passRecipe(recipeId);
    showUndo(recipeId);
    showPassReasonModal(recipeId);
  };

  const visibleRecipes = recipes.filter((r) => !passedRecipeIds.includes(r.id));
  const selectedRecipe = selectedRecipeId
    ? recipes.find((r) => r.id === selectedRecipeId) ?? null
    : null;

  return (
    <View style={styles.container}>
      <FlatList
        data={visibleRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => setSelectedRecipeId(item.id)}
            onHeart={() => heartRecipe(item.id)}
            onPin={() => pinRecipe(item.id)}
            onPass={() => handlePass(item.id)}
          />
        )}
      />
      <RecipeDetailModal
        visible={selectedRecipe !== null}
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipeId(undefined)}
        onHeart={selectedRecipe ? () => heartRecipe(selectedRecipe.id) : undefined}
        onPin={selectedRecipe ? () => pinRecipe(selectedRecipe.id) : undefined}
        onPass={selectedRecipe ? () => handlePass(selectedRecipe.id) : undefined}
      />
      {undoVisible && (
        <View style={styles.undoBanner}>
          <Text style={styles.undoText}>Recipe passed</Text>
          <View style={styles.undoActions}>
            <Pressable style={styles.undoButton} onPress={undo}>
              <Text style={styles.undoButtonText}>Undo</Text>
            </Pressable>
            <Pressable style={styles.dismissButton} onPress={dismissUndo}>
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      )}
      <PassReasonModal
        visible={passReasonVisible}
        recipeId={passReasonRecipeId ?? null}
        onClose={dismissPassReasonModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  undoBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#333',
  },
  undoText: {
    color: '#fff',
    fontSize: 15,
  },
  undoActions: {
    flexDirection: 'row',
  },
  undoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  undoButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  dismissButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dismissButtonText: {
    color: '#aaa',
  },
});
