import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Recipe } from '../types/recipe';

export interface RecipeCardProps {
  recipe: Recipe;
  onPress?: () => void;
  onHeart?: () => void;
  onPin?: () => void;
  onPass?: () => void;
}

export function RecipeCard({
  recipe,
  onPress,
  onHeart,
  onPin,
  onPass,
}: RecipeCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button">
      <View style={styles.header}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.meta}>
          {recipe.cuisine} · {recipe.totalMinutes} min
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onHeart} style={styles.button} accessibilityRole="button">
          <Text>Heart</Text>
        </Pressable>
        <Pressable onPress={onPin} style={styles.button} accessibilityRole="button">
          <Text>Pin</Text>
        </Pressable>
        <Pressable onPress={onPass} style={styles.button} accessibilityRole="button">
          <Text>Pass</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  meta: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
});
