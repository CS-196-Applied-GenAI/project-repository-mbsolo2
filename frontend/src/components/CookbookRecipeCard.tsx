import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Recipe } from '../types/recipe';

export interface CookbookRecipeCardProps {
  recipe: Recipe;
  isFavorite?: boolean;
  onPress?: () => void;
  onHeart?: () => void;
  onMarkCooked?: () => void;
}

export function CookbookRecipeCard({
  recipe,
  isFavorite,
  onPress,
  onHeart,
  onMarkCooked,
}: CookbookRecipeCardProps) {
  const hasImage = Boolean(recipe.photoUri);

  return (
    <Pressable
      style={[styles.card, hasImage && styles.cardWithImage]}
      onPress={onPress}
      accessibilityRole="button"
    >
      {hasImage ? (
        <View style={styles.thumbnailRow}>
          <Image
            source={{ uri: recipe.photoUri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.thumbnailMeta}>
            <Text style={styles.title} numberOfLines={2}>
              {recipe.title}
            </Text>
            {recipe.tags.length > 0 && (
              <Text style={styles.tags} numberOfLines={1}>
                {recipe.tags.join(' · ')}
              </Text>
            )}
            <View style={styles.actions}>
              {onHeart && (
                <Pressable onPress={onHeart} style={styles.button}>
                  <Text>{isFavorite ? '♥ Favorited' : '♡ Favorite'}</Text>
                </Pressable>
              )}
              {onMarkCooked && (
                <Pressable onPress={onMarkCooked} style={styles.button}>
                  <Text>Cooked</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.minimal}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>
          {recipe.tags.length > 0 && (
            <Text style={styles.tags} numberOfLines={1}>
              {recipe.tags.join(' · ')}
            </Text>
          )}
          <View style={styles.actions}>
            {onHeart && (
              <Pressable onPress={onHeart} style={styles.button}>
                <Text>{isFavorite ? '♥ Favorited' : '♡ Favorite'}</Text>
              </Pressable>
            )}
            {onMarkCooked && (
              <Pressable onPress={onMarkCooked} style={styles.button}>
                <Text>Cooked</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  cardWithImage: {},
  thumbnailRow: {
    flexDirection: 'row',
    padding: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  thumbnailMeta: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  minimal: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  tags: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
  },
});
