import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { chipColors, colors, fontSizes, fontWeights, radius, spacing } from '../theme';

export interface TagChipProps {
  label: string;
  selected?: boolean;
  /** Rainbow accent when selected; falls back to chipColors.selected if not set. */
  selectedAccentColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function TagChip({
  label,
  selected = false,
  selectedAccentColor,
  onPress,
  style,
}: TagChipProps) {
  const backgroundColor = selected
    ? (selectedAccentColor ?? chipColors.selected)
    : chipColors.background;

  const content = (
    <Text style={[styles.label, selected && styles.labelSelected]}>
      {label}
    </Text>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.chip,
          { backgroundColor },
          pressed && styles.chipPressed,
          style,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={label}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.chip, { backgroundColor }, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
  chipPressed: {
    opacity: 0.9,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    color: colors.text,
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: fontWeights.medium,
  },
});
