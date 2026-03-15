import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fontSizes, fontWeights, radius, spacing, textStyles } from '../theme';

export interface QuantityStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  style?: ViewStyle;
  /** Accessibility label for the value (e.g. "Quantity") */
  accessibilityLabel?: string;
}

/**
 * Stepper control: minus button, value, plus button. Uses design system radius and touch targets.
 */
export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  max,
  disabled = false,
  style,
  accessibilityLabel = 'Quantity',
}: QuantityStepperProps) {
  const canDecrement = value > min;
  const canIncrement = max == null || value < max;

  return (
    <View style={[styles.wrapper, style]} accessibilityLabel={`${accessibilityLabel} ${value}`}>
      <Pressable
        style={[styles.button, (!canDecrement || disabled) && styles.buttonDisabled]}
        onPress={onDecrement}
        disabled={!canDecrement || disabled}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
      >
        <Text style={styles.buttonText}>−</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        style={[styles.button, (!canIncrement || disabled) && styles.buttonDisabled]}
        onPress={onIncrement}
        disabled={!canIncrement || disabled}
        accessibilityRole="button"
        accessibilityLabel="Increase"
      >
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    color: colors.text,
  },
  value: {
    ...textStyles.body,
    minWidth: 28,
    textAlign: 'center',
    color: colors.text,
  },
});
