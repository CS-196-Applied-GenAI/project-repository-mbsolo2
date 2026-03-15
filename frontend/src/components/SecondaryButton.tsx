import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { borders, colors, fontSizes, fontWeights, padding, radius, semanticAccents } from '../theme';

export interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Outline style (border) vs text-only */
  variant?: 'outline' | 'text';
  style?: ViewStyle;
  accessibilityLabel?: string;
}

/**
 * Secondary action button: outline or text-only, uses semantic CTA color for text/border.
 */
export function SecondaryButton({
  title,
  onPress,
  disabled = false,
  size = 'md',
  variant = 'outline',
  style,
  accessibilityLabel,
}: SecondaryButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        size === 'lg' && styles.lg,
        variant === 'outline' && styles.outline,
        variant === 'text' && styles.textOnly,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' && styles.textSm,
          size === 'lg' && styles.textLg,
          variant === 'text' && styles.textOnlyLabel,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    ...padding.buttonMd,
  },
  sm: {
    ...padding.buttonSm,
  },
  lg: {
    ...padding.buttonLg,
  },
  outline: {
    ...borders.light,
    borderColor: semanticAccents.cta,
  },
  textOnly: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    color: semanticAccents.cta,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  textSm: {
    fontSize: fontSizes.sm,
  },
  textLg: {
    fontSize: fontSizes.md,
  },
  textOnlyLabel: {
    color: semanticAccents.cta,
  },
});
