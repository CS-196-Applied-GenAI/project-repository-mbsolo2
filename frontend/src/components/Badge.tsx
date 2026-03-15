import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fontSizes, fontWeights, radius, spacing, tagColors } from '../theme';

export type BadgeVariant = 'default' | 'positive' | 'destructive';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * Small pill badge/tag (e.g. "Easy", "Vegetarian"). Uses rainbow accent variants.
 */
export function Badge({ label, variant = 'default', onPress, style }: BadgeProps) {
  const backgroundColor =
    variant === 'positive'
      ? tagColors.positive
      : variant === 'destructive'
        ? colors.errorBackground
        : tagColors.default;

  const content = (
    <Text
      style={[
        styles.label,
        variant === 'positive' && styles.labelPositive,
        variant === 'destructive' && styles.labelDestructive,
      ]}
      numberOfLines={1}
    >
      {label}
    </Text>
  );

  if (onPress) {
    return (
      <Pressable
        style={[styles.badge, { backgroundColor }, style]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor }, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
  },
  labelPositive: {
    color: '#FFFFFF',
  },
  labelDestructive: {
    color: colors.error,
  },
});
