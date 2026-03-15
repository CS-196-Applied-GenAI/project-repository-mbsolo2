import { useRoute } from '@react-navigation/native';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CTAFeatureCard,
  EmptyState,
  ErrorState,
  FilterChip,
  LoadingState,
  RecipeCard,
  ScreenContainer,
  SearchBar,
  SectionHeader,
} from '../components';
import { PassReasonModal } from '../modals/PassReasonModal';
import { RecipeDetailModal } from '../modals/RecipeDetailModal';
import { cookbookStore } from '../store/cookbookStore';
import { feedStore } from '../store/feedStore';
import { inventoryStore } from '../store/inventoryStore';
import { uiStore } from '../store/uiStore';
import { upcomingStore } from '../store/upcomingStore';
import {
  colors,
  fontSizes,
  fontWeights,
  semanticAccents,
  screenPaddingHorizontal,
  spacing,
  textStyles,
} from '../theme';
import type { Recipe } from '../types/recipe';
import { matchRecipeToInventory, recipeUsesExpiringSoonIngredient } from '../utils/inventoryMatch';

type FilterChipValue = 'in_your_kitchen' | 'all' | 'upcoming';

export default function FeedScreen() {
  const route = useRoute();
  const [refreshing, setRefreshing] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChip, setFilterChip] = useState<FilterChipValue>('in_your_kitchen');
  const [cookWithWhatLoading, setCookWithWhatLoading] = useState(false);

  const fromKitchenParam = (route.params as { fromKitchen?: boolean } | undefined)?.fromKitchen;
  useEffect(() => {
    if (fromKitchenParam) {
      setFilterChip('in_your_kitchen');
    }
  }, [fromKitchenParam]);

  const recipes = feedStore((s) => s.recipes);
  const passedRecipeIds = feedStore((s) => s.passedRecipeIds);
  const selectedRecipeId = feedStore((s) => s.selectedRecipeId);
  const feedError = feedStore((s) => s.feedError);
  const inventoryItems = inventoryStore((s) => s.items);
  const fetchFeed = feedStore.getState().fetchFeed;
  const loadFromCache = feedStore.getState().loadFromCache;
  const setSelectedRecipeId = feedStore.getState().setSelectedRecipeId;
  const passRecipe = feedStore.getState().passRecipe;
  const recipesById = cookbookStore((s) => s.recipesById);
  const heartRecipe = cookbookStore.getState().heartRecipe;
  const pinned = upcomingStore((s) => s.pinned);
  const pinRecipe = upcomingStore.getState().pinRecipe;
  const unpinRecipe = upcomingStore.getState().unpinRecipe;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await loadFromCache();
      await fetchFeed();
      if (!cancelled) setHasFetchedOnce(true);
    };
    run();
    return () => {
      cancelled = true;
    };
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
  const feedStale = uiStore((s) => s.feedStale);
  const setFeedStale = uiStore.getState().setFeedStale;
  const showPassReasonModal = uiStore.getState().showPassReasonModal;
  const dismissPassReasonModal = uiStore.getState().dismissPassReasonModal;

  const handleRefreshBanner = useCallback(async () => {
    setRefreshing(true);
    await fetchFeed();
    setFeedStale(false);
    setRefreshing(false);
  }, [fetchFeed, setFeedStale]);

  /** Tap "Cook With What You Have": refetch feed (backend uses inventory + my-recipes); show In your kitchen. */
  const handleCookWithWhatYouHave = useCallback(async () => {
    setCookWithWhatLoading(true);
    await fetchFeed();
    setCookWithWhatLoading(false);
    setFilterChip('in_your_kitchen');
  }, [fetchFeed]);

  const handlePass = (recipeId: string) => {
    setSelectedRecipeId(undefined);
    passRecipe(recipeId);
    showUndo(recipeId);
    showPassReasonModal(recipeId);
  };

  const visibleRecipes = useMemo(
    () => recipes.filter((r) => !passedRecipeIds.includes(r.id)),
    [recipes, passedRecipeIds]
  );

  const matchByRecipeId = useMemo(() => {
    const map: Record<string, { matchLabel: string; missing: string[]; inKitchenCount: number; usesExpiringSoon: boolean }> = {};
    const feedIds = new Set(visibleRecipes.map((r) => r.id));
    const allRecipes = [...visibleRecipes];
    Object.values(recipesById).forEach((r) => {
      if (!feedIds.has(r.id)) allRecipes.push(r);
    });
    for (const r of allRecipes) {
      const ingNames = r.ingredientsHave ?? (r.ingredients?.map((i) => i.name) ?? []);
      const { inKitchenCount, totalCount, missingIngredients } = matchRecipeToInventory(
        ingNames,
        inventoryItems
      );
      const usesExpiringSoon = recipeUsesExpiringSoonIngredient(ingNames, inventoryItems);
      map[r.id] = {
        matchLabel: totalCount > 0 ? `${inKitchenCount}/${totalCount} in your kitchen` : '',
        missing: missingIngredients,
        inKitchenCount,
        usesExpiringSoon,
      };
    }
    return map;
  }, [visibleRecipes, recipesById, inventoryItems]);

  const pinnedRecipeIds = useMemo(
    () => new Set(pinned.map((p) => p.recipeId)),
    [pinned]
  );

  /** In your kitchen = no missing ingredients; All = everything; Upcoming = pinned. */
  const filteredRecipes = useMemo(() => {
    let list = visibleRecipes;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.ingredientsHave ?? []).some((ing) => ing.toLowerCase().includes(q))
      );
    }
    if (filterChip === 'in_your_kitchen') {
      list = list.filter((r) => {
        const match = matchByRecipeId[r.id];
        if (!match) return false;
        return !match.missing || match.missing.length === 0;
      });
    } else if (filterChip === 'upcoming') {
      const fromFeed = list.filter((r) => pinnedRecipeIds.has(r.id));
      const fromFeedIds = new Set(fromFeed.map((r) => r.id));
      const fromCookbook = Array.from(pinnedRecipeIds)
        .filter((id) => !fromFeedIds.has(id))
        .map((id) => recipesById[id])
        .filter(Boolean);
      list = [...fromFeed, ...fromCookbook];
    }
    return list;
  }, [visibleRecipes, searchQuery, filterChip, pinnedRecipeIds, recipesById, matchByRecipeId]);

  const selectedRecipe = selectedRecipeId
    ? recipes.find((r) => r.id === selectedRecipeId) ?? recipesById[selectedRecipeId] ?? null
    : null;

  const isInitialLoading = !hasFetchedOnce && recipes.length === 0;
  const isEmpty = hasFetchedOnce && filteredRecipes.length === 0;
  const isFeedError = Boolean(feedError) && recipes.length === 0;

  const sectionTitle =
    filterChip === 'upcoming'
      ? 'Upcoming'
      : filterChip === 'in_your_kitchen'
        ? 'In your kitchen'
        : 'All recipes';

  const listHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.pageTitle}>Discover</Text>
      <Text style={styles.pageSubtitle}>Recipes for you</Text>

      <View style={styles.searchRow}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search recipes…"
        />
      </View>

      <View style={styles.chipsRow}>
        <FilterChip
          label="In your kitchen"
          selected={filterChip === 'in_your_kitchen'}
          accentIndex={0}
          onPress={() => setFilterChip('in_your_kitchen')}
        />
        <FilterChip
          label="All"
          selected={filterChip === 'all'}
          accentIndex={2}
          onPress={() => setFilterChip('all')}
        />
        <FilterChip
          label="Upcoming"
          selected={filterChip === 'upcoming'}
          accentIndex={4}
          onPress={() => setFilterChip('upcoming')}
        />
      </View>

      {inventoryItems.length > 0 && (
        <Pressable
          style={({ pressed }) => [styles.ctaCard, pressed && styles.ctaCardPressed]}
          onPress={handleCookWithWhatYouHave}
          disabled={cookWithWhatLoading}
          accessibilityRole="button"
          accessibilityLabel="Cook with what you have"
        >
          <Text style={styles.ctaCardTitle}>Cook With What You Have</Text>
          <Text style={styles.ctaCardSubtitle}>
            Recipes based on your inventory
          </Text>
          {cookWithWhatLoading ? (
            <Text style={styles.ctaCardHint}>Finding recipes…</Text>
          ) : null}
        </Pressable>
      )}

      <SectionHeader title={sectionTitle} style={styles.sectionHeader} />

      {filterChip === 'upcoming' && filteredRecipes.length > 0 && (
        <View style={styles.resultBanner}>
          <CTAFeatureCard
            message={`You have ${filteredRecipes.length} recipe${filteredRecipes.length === 1 ? '' : 's'} scheduled.`}
            highlight={`${filteredRecipes.length} recipe${filteredRecipes.length === 1 ? '' : 's'}`}
          />
        </View>
      )}
    </View>
  );

  const emptyMessage =
    visibleRecipes.length === 0
      ? 'No recipes yet. Pull to refresh or add items to your kitchen to get suggestions.'
      : filterChip === 'upcoming'
        ? 'No upcoming recipes. Pin recipes from All or Cookbook to see them here.'
        : filterChip === 'in_your_kitchen'
          ? 'No recipes match your current inventory. Try "All" to see recipes with missing ingredients.'
          : 'No recipes match your search or filter.';

  const emptyActionLabel =
    filterChip === 'upcoming' && visibleRecipes.length > 0
      ? 'View all recipes'
      : filterChip === 'in_your_kitchen' && visibleRecipes.length > 0
        ? 'View all recipes'
        : 'Refresh';

  const emptyAction =
    filterChip === 'upcoming' && visibleRecipes.length > 0
      ? () => setFilterChip('all')
      : filterChip === 'in_your_kitchen' && visibleRecipes.length > 0
        ? () => setFilterChip('all')
        : onRefresh;

  const listEmpty = isEmpty ? (
    <EmptyState
      message={emptyMessage}
      actionLabel={emptyActionLabel}
      onAction={emptyAction}
    />
  ) : null;

  return (
    <ScreenContainer style={styles.screenWrapper}>
      {feedStale && (
        <View style={styles.feedStaleBanner}>
          <Text style={styles.feedStaleText}>New recipes available</Text>
          <Pressable style={styles.feedStaleButton} onPress={handleRefreshBanner}>
            <Text style={styles.feedStaleButtonText}>Refresh</Text>
          </Pressable>
        </View>
      )}
      {isInitialLoading ? (
        <LoadingState message="Loading recipes…" />
      ) : isFeedError ? (
        <ErrorState
          message={feedError ?? 'Something went wrong.'}
          actionLabel="Try again"
          onAction={onRefresh}
        />
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={filteredRecipes.length === 0 ? styles.listEmptyContainer : styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[semanticAccents.cta]}
              tintColor={semanticAccents.cta}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const match = matchByRecipeId[item.id];
            const isPinned = pinned.some((p) => p.recipeId === item.id);
            return (
              <RecipeCard
                recipe={item}
                matchLabel={match?.matchLabel}
                missingIngredients={match?.missing}
                isPinned={isPinned}
                usesExpiringSoon={match?.usesExpiringSoon ?? false}
                onPress={() => setSelectedRecipeId(item.id)}
                onHeart={() => heartRecipe(item.id, item)}
                onPin={() => (isPinned ? unpinRecipe(item.id) : pinRecipe(item.id))}
                onPass={() => handlePass(item.id)}
              />
            );
          }}
        />
      )}
      <RecipeDetailModal
        visible={selectedRecipe !== null}
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipeId(undefined)}
        onHeart={selectedRecipe ? () => heartRecipe(selectedRecipe.id, selectedRecipe) : undefined}
        onPin={
          selectedRecipe
            ? () =>
                pinned.some((p) => p.recipeId === selectedRecipe.id)
                  ? unpinRecipe(selectedRecipe.id)
                  : pinRecipe(selectedRecipe.id)
            : undefined
        }
        isPinned={selectedRecipe != null && pinned.some((p) => p.recipeId === selectedRecipe.id)}
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    backgroundColor: colors.background,
  },
  listHeader: {
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
    paddingHorizontal: screenPaddingHorizontal,
    backgroundColor: colors.background,
  },
  pageTitle: {
    ...textStyles.title,
    color: colors.text,
  },
  pageSubtitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondarySoft,
    marginTop: spacing[1],
  },
  searchRow: {
    marginTop: spacing[5],
    marginBottom: spacing[2],
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  ctaCard: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
    backgroundColor: colors.successBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accentGreen,
  },
  ctaCardPressed: {
    opacity: 0.95,
  },
  ctaCardTitle: {
    ...textStyles.titleSmall,
    color: colors.text,
  },
  ctaCardSubtitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondarySoft,
    marginTop: spacing[1],
  },
  ctaCardHint: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[2],
  },
  sectionHeader: {
    marginBottom: spacing[2],
  },
  resultBanner: {
    marginBottom: spacing[4],
  },
  listContent: {
    paddingHorizontal: screenPaddingHorizontal,
    paddingBottom: spacing[6],
  },
  listEmptyContainer: {
    flexGrow: 1,
    paddingBottom: spacing[6],
  },
  separator: {
    height: spacing[3],
  },
  feedStaleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: screenPaddingHorizontal,
    backgroundColor: colors.infoBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.infoBorder,
  },
  feedStaleText: {
    fontSize: 14,
    color: colors.info,
  },
  feedStaleButton: {
    minHeight: 44,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
    backgroundColor: semanticAccents.cta,
    borderRadius: 12,
  },
  feedStaleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textInverse,
  },
  undoBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    backgroundColor: colors.text,
  },
  undoText: {
    color: colors.textInverse,
    fontSize: fontSizes.base,
  },
  undoActions: {
    flexDirection: 'row',
  },
  undoButton: {
    minHeight: 44,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    marginRight: spacing[2],
    justifyContent: 'center',
  },
  undoButtonText: {
    color: colors.textInverse,
    fontWeight: fontWeights.semibold,
  },
  dismissButton: {
    minHeight: 44,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
  },
  dismissButtonText: {
    color: colors.textTertiary,
  },
});
