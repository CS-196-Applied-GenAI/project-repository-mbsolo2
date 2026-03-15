import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  CardContainer,
  ErrorState,
  LoadingState,
  PrimaryButton,
  SectionHeader,
} from '../components';
import {
  accentOrder,
  colors,
  fontSizes,
  fontWeights,
  radius,
  screenPaddingHorizontal,
  semanticAccents,
  spacing,
  textStyles,
} from '../theme';
import type { Recipe } from '../types/recipe';

export interface RecipeDetailModalProps {
  visible: boolean;
  recipe: Recipe | null;
  /** When true, show loading content inside modal (e.g. when fetching by id). */
  loading?: boolean;
  /** When set, show error state instead of recipe (e.g. fetch failed). */
  error?: string | null;
  onClose: () => void;
  onHeart?: () => void;
  onPin?: () => void;
  onPass?: () => void;
  /** True when recipe is scheduled as upcoming (pinned). */
  isPinned?: boolean;
  /** When set, show Edit button (e.g. from Cookbook). */
  onEdit?: () => void;
  /** When set, show Delete button (e.g. from Cookbook). */
  onDelete?: () => void;
}

export function RecipeDetailModal({
  visible,
  recipe,
  loading = false,
  error = null,
  onClose,
  onHeart,
  onPin,
  onPass,
  isPinned = false,
  onEdit,
  onDelete,
}: RecipeDetailModalProps) {
  const showRecipe = !loading && !error && recipe != null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>

        {loading ? (
          <LoadingState message="Loading recipe…" style={styles.centerBlock} />
        ) : error ? (
          <ErrorState
            message={error}
            actionLabel="Close"
            onAction={onClose}
            style={styles.centerBlock}
          />
        ) : showRecipe && recipe ? (
          <RecipeDetailContent
            recipe={recipe}
            onClose={onClose}
            onHeart={onHeart}
            onPin={onPin}
            onPass={onPass}
            isPinned={isPinned}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : null}
      </View>
    </Modal>
  );
}

function RecipeDetailContent({
  recipe,
  onClose,
  onHeart,
  onPin,
  onPass,
  isPinned = false,
  onEdit,
  onDelete,
}: {
  recipe: Recipe;
  onClose: () => void;
  onHeart?: () => void;
  onPin?: () => void;
  onPass?: () => void;
  isPinned?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const hasFullIngredients = recipe.ingredients != null && recipe.ingredients.length > 0;
  const ingredientLines = hasFullIngredients
    ? recipe.ingredients!.map(
        (i) => `${i.amount} ${i.unit} ${i.name}`.replace(/\s+/g, ' ').trim()
      )
    : recipe.ingredientsHave;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Large header image — only when recipe has a real image (user-uploaded or backend-provided) */}
      {recipe.photoUri ? (
        <View style={styles.heroImageWrap}>
          <Image
            source={{ uri: recipe.photoUri }}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityLabel="Recipe"
          />
        </View>
      ) : null}

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={4}>
          {recipe.title}
        </Text>

        {/* Metadata: time, servings, tags — only values present in recipe data */}
        <View style={styles.metaRow}>
          {recipe.totalMinutes > 0 && (
            <Text style={styles.metaItem}>{recipe.totalMinutes} min</Text>
          )}
          {recipe.totalMinutes > 0 && recipe.servings > 0 && (
            <Text style={styles.metaDot}>·</Text>
          )}
          {recipe.servings > 0 && (
            <Text style={styles.metaItem}>Servings: {recipe.servings}</Text>
          )}
          {recipe.tags.length > 0 && (recipe.totalMinutes > 0 || recipe.servings > 0) && (
            <Text style={styles.metaDot}>·</Text>
          )}
          {recipe.tags.length > 0 && (
            <Text style={styles.metaItem}>{recipe.tags.join(', ')}</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* Ingredients — polished list */}
        <SectionHeader title="Ingredients" style={styles.sectionHeader} />
        <CardContainer shadow="sm" style={styles.ingredientsCard}>
          {ingredientLines.length > 0 ? (
            ingredientLines.map((line, i) => (
              <View
                key={i}
                style={[
                  styles.ingredientRow,
                  i < ingredientLines.length - 1 && styles.ingredientRowBorder,
                ]}
              >
                <View style={[styles.ingredientBullet, { backgroundColor: accentOrder[i % accentOrder.length] }]} />
                <Text style={styles.ingredientText}>{line}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.muted}>No ingredients listed.</Text>
          )}
        </CardContainer>

        <View style={styles.divider} />

        {/* Instructions — numbered step blocks */}
        <SectionHeader title="Instructions" style={styles.sectionHeader} />
        <View style={styles.instructionsBlock}>
          {recipe.instructions.length > 0 ? (
            recipe.instructions.map((step, i) => (
              <View key={i} style={styles.stepBlock}>
                <View style={[styles.stepNumWrap, { backgroundColor: accentOrder[(i + 2) % accentOrder.length] }]}>
                  <Text style={styles.stepNum}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.muted}>No instructions listed.</Text>
          )}
        </View>

        {/* Why this recipe — only when backend provides it */}
        {recipe.why.length > 0 && (
          <>
            <View style={styles.divider} />
            <SectionHeader title="Why this recipe" style={styles.sectionHeader} />
            <View style={styles.whyContent}>
              {recipe.why.map((item, i) => (
                <Text key={i} style={styles.whyBullet}>
                  • {item}
                </Text>
              ))}
            </View>
          </>
        )}

        {/* Note — only when recipe has leftoverNote (real supported field) */}
        {recipe.leftoverNote != null && recipe.leftoverNote.trim() !== '' && (
          <>
            <View style={styles.divider} />
            <SectionHeader title="Note" style={styles.sectionHeader} />
            <View style={styles.noteContent}>
              <Text style={styles.noteText}>{recipe.leftoverNote}</Text>
            </View>
          </>
        )}

        {/* Actions — preserve save/bookmark behavior */}
        <View style={styles.divider} />
        <View style={styles.actions}>
          {onHeart != null && (
            <PrimaryButton
              title="Save to Cookbook"
              onPress={onHeart}
              size="lg"
              style={styles.primaryAction}
            />
          )}
          {onEdit != null && (
            <Pressable
              onPress={onEdit}
              style={styles.secondaryButton}
              accessibilityRole="button"
              accessibilityLabel="Edit recipe"
            >
              <Text style={styles.secondaryButtonText}>Edit</Text>
            </Pressable>
          )}
          {onDelete != null && (
            <Pressable
              onPress={onDelete}
              style={styles.secondaryButton}
              accessibilityRole="button"
              accessibilityLabel="Delete recipe"
            >
              <Text style={styles.secondaryButtonTextDestructive}>Delete</Text>
            </Pressable>
          )}
          <View style={styles.secondaryActions}>
            {onPin != null && (
              <Pressable
                onPress={onPin}
                style={styles.secondaryButton}
                accessibilityRole="button"
                accessibilityState={{ selected: isPinned }}
                accessibilityLabel={isPinned ? 'Pinned' : 'Pin'}
              >
                <Text style={[styles.secondaryButtonText, isPinned && styles.secondaryButtonTextPinned]}>
                  {isPinned ? 'Pinned' : 'Pin'}
                </Text>
              </Pressable>
            )}
            {onPass != null && (
              <Pressable onPress={onPass} style={styles.secondaryButton} accessibilityRole="button" accessibilityLabel="Pass">
                <Text style={styles.secondaryButtonText}>Pass</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.bottomPad} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: screenPaddingHorizontal,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surface,
  },
  backButton: {
    minHeight: 44,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    justifyContent: 'center',
  },
  backText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: semanticAccents.cta,
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[8],
  },
  heroImageWrap: {
    width: '100%',
    backgroundColor: colors.surfaceSubtle,
  },
  heroImage: {
    width: '100%',
    height: 240,
    backgroundColor: colors.surfaceSubtle,
  },
  body: {
    paddingHorizontal: screenPaddingHorizontal,
    paddingTop: spacing[5],
  },
  title: {
    ...textStyles.title,
    color: colors.text,
    marginBottom: spacing[3],
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing[1],
    marginBottom: spacing[4],
  },
  metaItem: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  metaDot: {
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: spacing[4],
  },
  sectionHeader: {
    marginBottom: spacing[2],
  },
  ingredientsCard: {
    padding: spacing[4],
    marginBottom: spacing[2],
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  ingredientRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing[3],
  },
  ingredientText: {
    flex: 1,
    ...textStyles.body,
    color: colors.text,
  },
  instructionsBlock: {
    marginBottom: spacing[2],
  },
  stepBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  stepNumWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  stepNum: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
  },
  stepText: {
    flex: 1,
    ...textStyles.body,
    color: colors.text,
    lineHeight: fontSizes.base * 1.5,
  },
  whyContent: {
    paddingVertical: spacing[2],
  },
  whyBullet: {
    ...textStyles.body,
    color: colors.text,
    marginBottom: spacing[2],
  },
  noteContent: {
    paddingVertical: spacing[2],
  },
  noteText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  muted: {
    ...textStyles.bodySmall,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  actions: {
    paddingTop: spacing[2],
  },
  primaryAction: {
    marginBottom: spacing[3],
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  secondaryButton: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  secondaryButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: semanticAccents.cta,
  },
  secondaryButtonTextPinned: {
    color: colors.success,
  },
  secondaryButtonTextDestructive: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.error,
  },
  bottomPad: {
    height: spacing[6],
  },
});
