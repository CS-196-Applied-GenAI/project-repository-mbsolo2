import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '../theme';

export interface CardContainerProps {
  children: ReactNode;
  /** Optional press handler; when provided, wraps content in Pressable */
  onPress?: () => void;
  /** Use 'sm' | 'md' for elevated cards; 'none' for flat (default) */
  shadow?: 'none' | 'sm' | 'md';
  style?: ViewStyle;
}

export function CardContainer({
  children,
  onPress,
  shadow = 'none',
  style,
}: CardContainerProps) {
  const cardStyle = [
    styles.card,
    shadow === 'sm' && shadows.sm,
    shadow === 'md' && shadows.md,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [...cardStyle, pressed && styles.pressed]}
        onPress={onPress}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pressed: {
    opacity: 0.98,
  },
});
