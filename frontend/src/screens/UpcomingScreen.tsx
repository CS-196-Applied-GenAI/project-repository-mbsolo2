import { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import { EmptyState, ScreenContainer, SectionHeader } from '../components';
import { cookbookStore } from '../store/cookbookStore';
import { feedStore } from '../store/feedStore';
import { inventoryStore } from '../store/inventoryStore';
import { upcomingStore } from '../store/upcomingStore';
import type { Bucket } from '../store/upcomingStore';
import type { Recipe } from '../types/recipe';
import { colors, fontSizes, fontWeights, spacing, textStyles } from '../theme';
import { matchRecipeToInventory, recipeUsesExpiringSoonIngredient } from '../utils/inventoryMatch';

const BUCKET_ORDER: Bucket[] = ['today', 'tomorrow', 'later'];
const BUCKET_LABELS: Record<Bucket, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  later: 'Later',
};

export default function UpcomingScreen() {
  const pinned = upcomingStore((s) => s.pinned);
  const feedRecipes = feedStore((s) => s.recipes);
  const recipesById = cookbookStore((s) => s.recipesById);
  const inventoryItems = inventoryStore((s) => s.items);

  /** All pinned recipes: from feed first, then cookbook for any pinned id not in feed. */
  const recipeMap = useMemo(() => {
    const map = new Map<string, Recipe>();
    feedRecipes.forEach((r) => map.set(r.id, r));
    pinned.forEach((p) => {
      if (!map.has(p.recipeId) && recipesById[p.recipeId]) {
        map.set(p.recipeId, recipesById[p.recipeId]);
      }
    });
    return map;
  }, [feedRecipes, pinned, recipesById]);

  const itemMeta = useMemo(() => {
    const map: Record<string, { missingIngredients: boolean; usesExpiringSoon: boolean }> = {};
    recipeMap.forEach((recipe, id) => {
      const ingNames = recipe.ingredientsHave ?? (recipe.ingredients?.map((i) => i.name) ?? []);
      const { missingIngredients } = matchRecipeToInventory(ingNames, inventoryItems);
      const usesExpiringSoon = recipeUsesExpiringSoonIngredient(ingNames, inventoryItems);
      map[id] = {
        missingIngredients: missingIngredients.length > 0,
        usesExpiringSoon,
      };
    });
    return map;
  }, [recipeMap, inventoryItems]);

  const sections = useMemo(() => {
    const raw = BUCKET_ORDER.map((bucket) => {
      const data = pinned
        .filter((p) => p.bucket === bucket)
        .map((p) => ({ recipeId: p.recipeId, recipe: recipeMap.get(p.recipeId) }));
      return { title: BUCKET_LABELS[bucket], data };
    });
    return raw.filter((s) => s.data.length > 0);
  }, [pinned, recipeMap]);

  return (
    <ScreenContainer style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.recipeId}
        renderSectionHeader={({ section }) => (
          <SectionHeader title={section.title} />
        )}
        renderItem={({ item }) => {
          const meta = itemMeta[item.recipeId];
          return (
            <View style={styles.row}>
              <Text style={styles.title}>
                {item.recipe?.title ?? 'Unknown recipe'}
              </Text>
              <View style={styles.tagRow}>
                {meta?.missingIngredients && (
                  <Text style={styles.tagMissing}>Missing ingredients</Text>
                )}
                {meta?.usesExpiringSoon && (
                  <Text style={styles.tagExpiring}>Uses expiring soon</Text>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState message="No pinned recipes yet. Pin from Discover or Cookbook to plan your week." />
        }
        contentContainerStyle={sections.length === 0 ? styles.emptyList : undefined}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  row: {
    padding: spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surface,
  },
  title: {
    ...textStyles.body,
    color: colors.text,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  tagMissing: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.warning,
    backgroundColor: colors.warningBackground,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
    overflow: 'hidden',
  },
  tagExpiring: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.warning,
    backgroundColor: colors.warningBackground,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
    overflow: 'hidden',
  },
  emptyList: {
    flexGrow: 1,
  },
});
