import { useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  CookbookRecipeCard,
  EmptyState,
  LoadingState,
  PrimaryButton,
  ScreenContainer,
  TagChip,
} from '../components';
import { AddRecipeModal } from '../modals/AddRecipeModal';
import { RecipeDetailModal } from '../modals/RecipeDetailModal';
import {
  cookbookStore,
  type CookbookFilter,
} from '../store/cookbookStore';
import { inventoryStore } from '../store/inventoryStore';
import { upcomingStore } from '../store/upcomingStore';
import { accentOrder, colors, fontSizes, fontWeights, spacing } from '../theme';
import type { Recipe } from '../types/recipe';
import { matchRecipeToInventory, recipeUsesExpiringSoonIngredient } from '../utils/inventoryMatch';

const COOKBOOK_FILTERS: CookbookFilter[] = ['all', 'favorites', 'cooked', 'my-recipes'];

function isCookbookFilter(value: unknown): value is CookbookFilter {
  return typeof value === 'string' && COOKBOOK_FILTERS.includes(value as CookbookFilter);
}

const FILTERS: { key: CookbookFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'cooked', label: 'Cooked' },
  { key: 'my-recipes', label: 'My Recipes' },
];

function getEmptyMessage(filter: CookbookFilter): string {
  switch (filter) {
    case 'all':
      return 'No recipes yet. Save from Discover or add your own.';
    case 'favorites':
      return 'No favorites. Heart recipes in Discover to see them here.';
    case 'cooked':
      return 'No cooked recipes yet. Mark recipes as cooked when you try them.';
    case 'my-recipes':
      return 'No custom recipes. Tap "Add Recipe" to create one.';
    default:
      return 'No recipes to show.';
  }
}

export default function CookbookScreen() {
  const route = useRoute();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const [filter, setFilter] = useState<CookbookFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const recipesById = cookbookStore((s) => s.recipesById);
  const favorites = cookbookStore((s) => s.favorites);
  const cookedRecipeIds = cookbookStore((s) => s.cookedRecipeIds);
  const loadFromCache = cookbookStore.getState().loadFromCache;
  const getFilteredRecipes = cookbookStore.getState().getFilteredRecipes;
  const heartRecipe = cookbookStore.getState().heartRecipe;
  const unheartRecipe = cookbookStore.getState().unheartRecipe;
  const markAsCooked = cookbookStore.getState().markAsCooked;
  const unmarkAsCooked = cookbookStore.getState().unmarkAsCooked;
  const deleteRecipe = cookbookStore.getState().deleteRecipe;
  const pinned = upcomingStore((s) => s.pinned);
  const pinRecipe = upcomingStore.getState().pinRecipe;
  const unpinRecipe = upcomingStore.getState().unpinRecipe;
  const inventoryItems = inventoryStore((s) => s.items);

  const initialFilter = route.params?.initialFilter;
  useEffect(() => {
    if (initialFilter != null && isCookbookFilter(initialFilter)) {
      setFilter(initialFilter);
    }
  }, [initialFilter]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await loadFromCache();
      if (!cancelled) setInitialLoadDone(true);
    };
    run();
    return () => { cancelled = true; };
  }, [loadFromCache]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFromCache();
    setRefreshing(false);
  }, [loadFromCache]);

  const filtered = useMemo(
    () => getFilteredRecipes(filter),
    [getFilteredRecipes, filter, recipesById, favorites, cookedRecipeIds]
  );

  const recipes = useMemo(
    () => [...filtered].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })),
    [filtered]
  );

  const selectedRecipe = selectedRecipeId != null ? recipesById[selectedRecipeId] ?? null : null;
  const isFavorite = (id: string) => favorites.includes(id);
  const isCooked = (id: string) => cookedRecipeIds.includes(id);
  const isPinned = (id: string) => pinned.some((p) => p.recipeId === id);

  const recipeMeta = useMemo(() => {
    const map: Record<string, { missingIngredients: boolean; usesExpiringSoon: boolean }> = {};
    for (const r of recipes) {
      const ingNames = r.ingredientsHave ?? (r.ingredients?.map((i) => i.name) ?? []);
      const { missingIngredients } = matchRecipeToInventory(ingNames, inventoryItems);
      const usesExpiringSoon = recipeUsesExpiringSoonIngredient(ingNames, inventoryItems);
      map[r.id] = {
        missingIngredients: missingIngredients.length > 0,
        usesExpiringSoon,
      };
    }
    return map;
  }, [recipes, inventoryItems]);

  const handleHeart = useCallback(
    (recipe: Recipe) => {
      if (isFavorite(recipe.id)) {
        unheartRecipe(recipe.id);
      } else {
        heartRecipe(recipe.id, recipe);
      }
    },
    [favorites, heartRecipe, unheartRecipe]
  );

  const handleMarkCooked = useCallback(
    (recipe: Recipe) => {
      if (isCooked(recipe.id)) {
        unmarkAsCooked(recipe.id);
      } else {
        markAsCooked(recipe.id, recipe);
      }
    },
    [cookedRecipeIds, markAsCooked, unmarkAsCooked]
  );

  const handleEditRecipe = useCallback(() => {
    if (selectedRecipe) {
      setRecipeToEdit(selectedRecipe);
      setSelectedRecipeId(null);
      setAddModalVisible(true);
    }
  }, [selectedRecipe]);

  const handleDeleteRecipe = useCallback(() => {
    if (!selectedRecipe) return;
    const recipeId = selectedRecipe.id;
    const title = selectedRecipe.title;
    Alert.alert(
      'Delete recipe?',
      `Remove "${title}" from your cookbook? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteRecipe(recipeId);
            setSelectedRecipeId(null);
          },
        },
      ]
    );
  }, [selectedRecipe, deleteRecipe]);

  const emptyComponent = (
    <EmptyState
      message={getEmptyMessage(filter)}
      actionLabel={filter === 'all' || filter === 'my-recipes' ? 'Add Recipe' : undefined}
      onAction={filter === 'all' || filter === 'my-recipes' ? () => setAddModalVisible(true) : undefined}
    />
  );

  if (!initialLoadDone && !refreshing) {
    return (
      <ScreenContainer style={styles.screen}>
        <LoadingState message="Loading cookbook…" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cookbook</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Add Recipe"
        >
          <Text style={styles.addButtonText}>+ Add Recipe</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(({ key, label }, index) => (
          <TagChip
            key={key}
            label={label}
            selected={filter === key}
            selectedAccentColor={accentOrder[index % accentOrder.length]}
            onPress={() => setFilter(key)}
          />
        ))}
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        extraData={recipes}
        contentContainerStyle={recipes.length === 0 ? styles.listEmpty : styles.listContent}
        ListEmptyComponent={emptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const meta = recipeMeta[item.id];
          return (
            <CookbookRecipeCard
              recipe={item}
              isFavorite={isFavorite(item.id)}
              isCooked={isCooked(item.id)}
              isPinned={isPinned(item.id)}
              missingIngredients={meta?.missingIngredients}
              usesExpiringSoon={meta?.usesExpiringSoon}
              onPress={() => setSelectedRecipeId(item.id)}
              onHeart={() => handleHeart(item)}
              onMarkCooked={() => handleMarkCooked(item)}
              onPin={() => (isPinned(item.id) ? unpinRecipe(item.id) : pinRecipe(item.id))}
            />
          );
        }}
      />

      <AddRecipeModal
        visible={addModalVisible}
        onClose={() => {
          setAddModalVisible(false);
          setRecipeToEdit(null);
        }}
        onAdded={() => setAddModalVisible(false)}
        recipeToEdit={recipeToEdit}
        onUpdated={() => {
          setAddModalVisible(false);
          setRecipeToEdit(null);
        }}
      />
      <RecipeDetailModal
        visible={selectedRecipe != null}
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipeId(null)}
        onHeart={selectedRecipe ? () => handleHeart(selectedRecipe) : undefined}
        onPin={
          selectedRecipe
            ? () => (isPinned(selectedRecipe.id) ? unpinRecipe(selectedRecipe.id) : pinRecipe(selectedRecipe.id))
            : undefined
        }
        isPinned={selectedRecipe != null && isPinned(selectedRecipe.id)}
        onPass={undefined}
        onEdit={selectedRecipe ? handleEditRecipe : undefined}
        onDelete={selectedRecipe ? handleDeleteRecipe : undefined}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  addButton: {
    minHeight: 44,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.accentBlue,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  listEmpty: {
    flexGrow: 1,
    paddingBottom: spacing[6],
  },
  separator: {
    height: spacing[3],
  },
});
