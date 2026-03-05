import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { RecipeCard } from '../components/RecipeCard';
import { PassReasonModal } from '../modals/PassReasonModal';
import { RecipeDetailModal } from '../modals/RecipeDetailModal';
import { cookbookStore } from '../store/cookbookStore';
import { feedStore } from '../store/feedStore';
import { uiStore } from '../store/uiStore';
import { upcomingStore } from '../store/upcomingStore';
import type { Recipe } from '../types/recipe';

export default function FeedScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const recipes = feedStore((s) => s.recipes);
  const passedRecipeIds = feedStore((s) => s.passedRecipeIds);
  const selectedRecipeId = feedStore((s) => s.selectedRecipeId);
  const fetchFeed = feedStore.getState().fetchFeed;
  const loadFromCache = feedStore.getState().loadFromCache;
  const setSelectedRecipeId = feedStore.getState().setSelectedRecipeId;
  const passRecipe = feedStore.getState().passRecipe;
  const heartRecipe = cookbookStore.getState().heartRecipe;
  const pinRecipe = upcomingStore.getState().pinRecipe;

  useEffect(() => {
    const run = async () => {
      await loadFromCache();
      await fetchFeed();
    };
    run();
  }, [fetchFeed, loadFromCache]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  }, [fetchFeed]);

  const undoVisible = uiStore((s) => s.undoVisible);
  const undoPassRecipeId = uiStore((s) => s.undoPassRecipeId);
  const showUndo = uiStore.getState().showUndo;
  const dismissUndo = uiStore.getState().dismissUndo;
  const undo = uiStore.getState().undo;
  const passReasonVisible = uiStore((s) => s.passReasonVisible);
  const passReasonRecipeId = uiStore((s) => s.passReasonRecipeId);
  const showPassReasonModal = uiStore.getState().showPassReasonModal;
  const dismissPassReasonModal = uiStore.getState().dismissPassReasonModal;

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => setSelectedRecipeId(item.id)}
            onHeart={() => heartRecipe(item.id, item)}
            onPin={() => pinRecipe(item.id)}
            onPass={() => handlePass(item.id)}
          />
        )}
      />
      <RecipeDetailModal
        visible={selectedRecipe !== null}
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipeId(undefined)}
        onHeart={selectedRecipe ? () => heartRecipe(selectedRecipe.id, selectedRecipe) : undefined}
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
