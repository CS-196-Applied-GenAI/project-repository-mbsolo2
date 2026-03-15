import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { colors, fontSizes, fontWeights, padding, radius, semanticAccents } from '../theme';

export interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  size = 'md',
  style,
  accessibilityLabel,
}: PrimaryButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        size === 'lg' && styles.lg,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
    >
      <Text style={[styles.text, size === 'sm' && styles.textSm, size === 'lg' && styles.textLg]}>
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
    backgroundColor: semanticAccents.cta,
    borderRadius: radius.lg,
    ...padding.buttonMd,
  },
  sm: {
    ...padding.buttonSm,
  },
  lg: {
    ...padding.buttonLg,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.92,
  },
  text: {
    color: colors.textInverse,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  textSm: {
    fontSize: fontSizes.sm,
  },
  textLg: {
    fontSize: fontSizes.md,
  },
});
