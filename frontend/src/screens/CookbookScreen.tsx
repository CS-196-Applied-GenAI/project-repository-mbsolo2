import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CookbookRecipeCard } from '../components/CookbookRecipeCard';
import { AddRecipeModal } from '../modals/AddRecipeModal';
import { RecipeDetailModal } from '../modals/RecipeDetailModal';
import {
  cookbookStore,
  type CookbookFilter,
} from '../store/cookbookStore';
import type { Recipe } from '../types/recipe';

const FILTERS: { key: CookbookFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cooked', label: 'Cooked' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'my-recipes', label: 'My Recipes' },
];

export default function CookbookScreen() {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [filter, setFilter] = useState<CookbookFilter>('all');

  const recipesById = cookbookStore((s) => s.recipesById);
  const favorites = cookbookStore((s) => s.favorites);
  const cookedRecipeIds = cookbookStore((s) => s.cookedRecipeIds);
  const getFilteredRecipes = cookbookStore.getState().getFilteredRecipes;
  const heartRecipe = cookbookStore.getState().heartRecipe;
  const unheartRecipe = cookbookStore.getState().unheartRecipe;
  const markAsCooked = cookbookStore.getState().markAsCooked;
  const unmarkAsCooked = cookbookStore.getState().unmarkAsCooked;

  const recipes = useMemo(() => getFilteredRecipes(filter), [getFilteredRecipes, filter, recipesById, favorites, cookedRecipeIds]);

  const selectedRecipe = selectedRecipeId != null ? recipesById[selectedRecipeId] ?? null : null;
  const isFavorite = (id: string) => favorites.includes(id);
  const isCooked = (id: string) => cookedRecipeIds.includes(id);

  const handleHeart = useCallback((recipe: Recipe) => {
    if (isFavorite(recipe.id)) {
      unheartRecipe(recipe.id);
    } else {
      heartRecipe(recipe.id, recipe);
    }
  }, [favorites, heartRecipe, unheartRecipe]);

  const handleMarkCooked = useCallback((recipeId: string) => {
    if (isCooked(recipeId)) {
      unmarkAsCooked(recipeId);
    } else {
      markAsCooked(recipeId);
    }
  }, [cookedRecipeIds, markAsCooked, unmarkAsCooked]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cookbook</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
          accessibilityRole="button"
        >
          <Text style={styles.addButtonText}>+ Add Recipe</Text>
        </Pressable>
      </View>
      <View style={styles.filterRow}>
        {FILTERS.map(({ key, label }) => (
          <Pressable
            key={key}
            style={[styles.filterChip, filter === key && styles.filterChipActive]}
            onPress={() => setFilter(key)}
          >
            <Text style={[styles.filterLabel, filter === key && styles.filterLabelActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CookbookRecipeCard
            recipe={item}
            isFavorite={isFavorite(item.id)}
            onPress={() => setSelectedRecipeId(item.id)}
            onHeart={() => handleHeart(item)}
            onMarkCooked={() => handleMarkCooked(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'No recipes yet. Heart from Feed or add your own.'
                : `No ${filter === 'my-recipes' ? 'my recipes' : filter}.`}
            </Text>
          </View>
        }
      />
      <AddRecipeModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdded={() => setAddModalVisible(false)}
      />
      <RecipeDetailModal
        visible={selectedRecipe != null}
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipeId(null)}
        onHeart={selectedRecipe ? () => handleHeart(selectedRecipe) : undefined}
        onPin={undefined}
        onPass={undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterLabel: {
    fontSize: 14,
    color: '#333',
  },
  filterLabelActive: {
    color: '#fff',
    fontWeight: '500',
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
});
