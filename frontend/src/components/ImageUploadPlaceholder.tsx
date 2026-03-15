import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { borders, colors, fontSizes, fontWeights, radius, spacing, textStyles } from '../theme';

export interface ImageUploadPlaceholderProps {
  /** Hint text (e.g. "Add photo" or "Tap to add image") */
  label?: string;
  /** Optional secondary hint */
  hint?: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Dashed-border placeholder for photo upload. Uses design system borders.dashedPlaceholder and accent CTA.
 */
export function ImageUploadPlaceholder({
  label = 'Add photo',
  hint,
  onPress,
  disabled = false,
  style,
}: ImageUploadPlaceholderProps) {
  return (
    <Pressable
      style={[styles.container, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.label}>{label}</Text>
      {hint != null && hint !== '' && (
        <Text style={styles.hint}>{hint}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
    borderRadius: radius.lg,
    padding: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...borders.dashedPlaceholder,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    ...textStyles.label,
    color: colors.textSecondarySoft,
  },
  hint: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[1],
  },
});
