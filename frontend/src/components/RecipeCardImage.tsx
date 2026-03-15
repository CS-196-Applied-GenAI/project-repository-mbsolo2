import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius } from '../theme';

export interface RecipeCardImageProps {
  /** Image URI (user-uploaded or backend). When null/undefined, nothing is rendered. */
  imageUri: string | null | undefined;
  /** 'card' = full-width aspect ratio; 'thumbnail' = 72x72 for list rows */
  size?: 'card' | 'thumbnail';
  /** Aspect ratio width (card only, default 16) */
  aspectW?: number;
  /** Aspect ratio height (card only, default 10) */
  aspectH?: number;
  style?: ViewStyle;
}

/**
 * Recipe image block. Renders nothing when imageUri is missing so cards stay elegant without a placeholder.
 */
export function RecipeCardImage({
  imageUri,
  size = 'card',
  aspectW = 16,
  aspectH = 10,
  style,
}: RecipeCardImageProps) {
  if (imageUri == null || imageUri === '') {
    return null;
  }

  const isThumb = size === 'thumbnail';

  return (
    <View
      style={[
        styles.wrapper,
        isThumb ? styles.thumbnail : [styles.cardSize, { aspectRatio: aspectW / aspectH, borderRadius: radius.lg }],
        style,
      ]}
    >
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, { borderRadius: isThumb ? radius.sm : radius.lg }]}
        resizeMode="cover"
        accessibilityLabel="Recipe"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surfaceSubtle,
    overflow: 'hidden',
  },
  cardSize: {
    width: '100%',
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
