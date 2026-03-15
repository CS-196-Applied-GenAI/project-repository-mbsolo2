import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, semanticAccents, spacing } from '../theme';
import type { Recipe } from '../types/recipe';

import { CardContainer } from './CardContainer';
import { RecipeCardImage } from './RecipeCardImage';

export interface CookbookRecipeCardProps {
  recipe: Recipe;
  isFavorite?: boolean;
  isCooked?: boolean;
  /** True when recipe is scheduled as upcoming (pinned). */
  isPinned?: boolean;
  /** When true, show "Missing ingredients" tag. */
  missingIngredients?: boolean;
  /** When true, show "Uses expiring soon" tag. */
  usesExpiringSoon?: boolean;
  onPress?: () => void;
  onHeart?: () => void;
  onMarkCooked?: () => void;
  onPin?: () => void;
}

/**
 * Cookbook list recipe card. Image only when recipe.photoUri exists; otherwise text-only layout.
 */
export function CookbookRecipeCard({
  recipe,
  isFavorite,
  isCooked = false,
  isPinned = false,
  missingIngredients = false,
  usesExpiringSoon = false,
  onPress,
  onHeart,
  onMarkCooked,
  onPin,
}: CookbookRecipeCardProps) {
  const hasImage = Boolean(recipe.photoUri);

  const metaBlock = (
    <View style={styles.metaBlock}>
      <Text style={styles.title} numberOfLines={2}>
        {recipe.title}
      </Text>
      <View style={styles.tagRow}>
        {missingIngredients && (
          <Text style={styles.tagMissing}>Missing ingredients</Text>
        )}
        {usesExpiringSoon && (
          <Text style={styles.tagExpiring}>Uses expiring soon</Text>
        )}
      </View>
      {recipe.tags.length > 0 && (
        <Text style={styles.tags} numberOfLines={1}>
          {recipe.tags.join(' · ')}
        </Text>
      )}
      {recipe.servings > 0 && (
        <Text style={styles.meta}>{recipe.servings} servings</Text>
      )}
      <View style={styles.actions}>
        {onHeart != null && (
          <Pressable onPress={onHeart} style={styles.button} accessibilityRole="button">
            <Text style={styles.buttonText}>{isFavorite ? '♥ Favorited' : '♡ Favorite'}</Text>
          </Pressable>
        )}
        {onMarkCooked != null && (
          <Pressable
            onPress={onMarkCooked}
            style={styles.button}
            accessibilityRole="button"
            accessibilityState={{ selected: isCooked }}
          >
            <Text style={[styles.buttonText, isCooked && styles.buttonTextCooked]}>
              {isCooked ? '✓ Cooked' : 'Mark as cooked'}
            </Text>
          </Pressable>
        )}
        {onPin != null && (
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
        )}
      </View>
    </View>
  );

  return (
    <CardContainer onPress={onPress} shadow="sm">
      {hasImage ? (
        <View style={styles.thumbnailRow}>
          <RecipeCardImage imageUri={recipe.photoUri} size="thumbnail" style={styles.thumb} />
          {metaBlock}
        </View>
      ) : (
        metaBlock
      )}
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  thumbnailRow: {
    flexDirection: 'row',
  },
  thumb: {
    marginRight: spacing[3],
  },
  metaBlock: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.xl * lineHeights.tight,
    color: colors.text,
  },
  tags: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  meta: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    marginTop: spacing[1],
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing[3],
    gap: spacing[2],
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
  buttonTextCooked: {
    color: colors.success,
  },
  buttonTextPinned: {
    color: colors.success,
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
});
