import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, semanticAccents, spacing, tagColors } from '../theme';
import type { Recipe } from '../types/recipe';

import { CardContainer } from './CardContainer';
import { RecipeCardImage } from './RecipeCardImage';

export interface RecipeCardProps {
  recipe: Recipe;
  /** e.g. "3/5 in your kitchen" — derived from inventory; only show when provided. */
  matchLabel?: string | null;
  /** Ingredients not in inventory — derived client-side; only show when provided and non-empty. */
  missingIngredients?: string[] | null;
  /** True when recipe is scheduled as upcoming (pinned). */
  isPinned?: boolean;
  /** True when recipe uses at least one ingredient that expires soon in inventory. */
  usesExpiringSoon?: boolean;
  onPress?: () => void;
  onHeart?: () => void;
  onPin?: () => void;
  onPass?: () => void;
}

/**
 * Discover feed recipe card. Renders image only when recipe.photoUri exists; otherwise no image block.
 */
export function RecipeCard({
  recipe,
  matchLabel,
  missingIngredients,
  isPinned = false,
  usesExpiringSoon = false,
  onPress,
  onHeart,
  onPin,
  onPass,
}: RecipeCardProps) {
  const metaParts: string[] = [];
  if (recipe.cuisine) metaParts.push(recipe.cuisine);
  if (recipe.totalMinutes > 0) metaParts.push(`${recipe.totalMinutes} min`);
  if (recipe.servings > 0) metaParts.push(`${recipe.servings} servings`);
  const metaLine = metaParts.length > 0 ? metaParts.join(' · ') : null;
  const showMissing =
    missingIngredients && missingIngredients.length > 0;

  return (
    <CardContainer onPress={onPress} shadow="sm">
      <RecipeCardImage imageUri={recipe.photoUri} style={styles.imageBlock} />
      <View style={styles.header}>
        <Text style={styles.title}>{recipe.title}</Text>
        {metaLine !== null && <Text style={styles.meta}>{metaLine}</Text>}
        <View style={styles.tagRow}>
          {showMissing && (
            <Text style={styles.tagMissing}>Missing ingredients</Text>
          )}
          {usesExpiringSoon && (
            <Text style={styles.tagExpiring}>Uses expiring soon</Text>
          )}
        </View>
        {matchLabel != null && matchLabel !== '' && (
          <Text style={styles.matchLabel}>{matchLabel}</Text>
        )}
        {showMissing && (
          <Text style={styles.missing} numberOfLines={2}>
            Missing: {missingIngredients!.slice(0, 3).join(', ')}
            {missingIngredients!.length > 3 ? '…' : ''}
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onHeart} style={styles.button} accessibilityRole="button">
          <Text style={styles.buttonText}>Heart</Text>
        </Pressable>
        <Pressable
          onPress={onPin}
          style={styles.button}
          accessibilityRole="button"
          accessibilityState={{ selected: isPinned }}
        >
          <Text style={[styles.buttonText, isPinned && styles.buttonTextPinned]}>
            {isPinned ? 'Pinned' : 'Pin'}
          </Text>
        </Pressable>
        <Pressable onPress={onPass} style={styles.button} accessibilityRole="button">
          <Text style={styles.buttonText}>Pass</Text>
        </Pressable>
      </View>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  imageBlock: {
    marginBottom: spacing[3],
  },
  header: {
    marginBottom: spacing[2],
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.xl * lineHeights.tight,
    color: colors.text,
  },
  meta: {
    fontSize: fontSizes.sm,
    color: colors.textSecondarySoft,
    marginTop: spacing[1],
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[1],
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
  matchLabel: {
    fontSize: fontSizes.sm,
    color: tagColors.positive,
    marginTop: spacing[1],
    fontWeight: fontWeights.medium,
  },
  missing: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    marginTop: spacing[1],
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[1],
  },
  button: {
    minHeight: 44,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: semanticAccents.cta,
  },
  buttonTextPinned: {
    color: colors.success,
  },
});
