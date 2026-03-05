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

import type { Recipe } from '../types/recipe';

export interface RecipeDetailModalProps {
  visible: boolean;
  recipe: Recipe | null;
  onClose: () => void;
  onHeart?: () => void;
  onPin?: () => void;
  onPass?: () => void;
}

export function RecipeDetailModal({
  visible,
  recipe,
  onClose,
  onHeart,
  onPin,
  onPass,
}: RecipeDetailModalProps) {
  if (!recipe) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button">
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* A) Title + image only if recipe.photoUri exists */}
          <Text style={styles.title}>{recipe.title}</Text>
          {recipe.photoUri ? (
            <Image source={{ uri: recipe.photoUri }} style={styles.image} resizeMode="cover" />
          ) : null}

          {/* B) Why this recipe */}
          {recipe.why.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Why this recipe</Text>
              {recipe.why.map((item, i) => (
                <Text key={i} style={styles.bullet}>
                  • {item}
                </Text>
              ))}
            </View>
          )}

          {/* C) Ingredients split */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Already in your kitchen</Text>
            {recipe.ingredientsHave.map((ing, i) => (
              <Text key={i} style={styles.bullet}>
                • {ing}
              </Text>
            ))}
            <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>You may want</Text>
            {recipe.ingredientsMaybeWant.map((ing, i) => (
              <Text key={i} style={styles.bullet}>
                • {ing}
              </Text>
            ))}
          </View>

          {/* D) Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.instructions.map((step, i) => (
              <Text key={i} style={styles.step}>
                {i + 1}. {step}
              </Text>
            ))}
          </View>

          {/* E) Time estimate */}
          <View style={styles.section}>
            <Text style={styles.meta}>Time: {recipe.totalMinutes} min</Text>
          </View>

          {/* F) Servings + leftover note */}
          <View style={styles.section}>
            <Text style={styles.meta}>Servings: {recipe.servings}</Text>
            {recipe.leftoverNote ? (
              <Text style={styles.leftoverNote}>{recipe.leftoverNote}</Text>
            ) : null}
          </View>

          {/* G) Tags */}
          {recipe.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <Text style={styles.tags}>{recipe.tags.join(' · ')}</Text>
            </View>
          )}

          {/* H) Action buttons */}
          <View style={styles.actions}>
            {onHeart != null && (
              <Pressable onPress={onHeart} style={styles.actionButton} accessibilityRole="button">
                <Text>Heart</Text>
              </Pressable>
            )}
            {onPin != null && (
              <Pressable onPress={onPin} style={styles.actionButton} accessibilityRole="button">
                <Text>Pin</Text>
              </Pressable>
            )}
            {onPass != null && (
              <Pressable onPress={onPass} style={styles.actionButton} accessibilityRole="button">
                <Text>Pass</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    color: '#007AFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionTitleSpaced: {
    marginTop: 12,
  },
  bullet: {
    fontSize: 15,
    marginBottom: 4,
  },
  step: {
    fontSize: 15,
    marginBottom: 8,
  },
  meta: {
    fontSize: 15,
    color: '#666',
  },
  leftoverNote: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  tags: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
  },
});
