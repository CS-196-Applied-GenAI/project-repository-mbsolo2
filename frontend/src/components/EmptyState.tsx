import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, spacing, textStyles } from '../theme';

import { PrimaryButton } from './PrimaryButton';

export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

/**
 * Empty state block: message and optional primary CTA. Uses design system spacing and typography.
 */
export function EmptyState({
  message,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.message}>{message}</Text>
      {actionLabel != null && onAction != null && (
        <PrimaryButton
          title={actionLabel}
          onPress={onAction}
          size="md"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[6],
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    ...textStyles.body,
    color: colors.textSecondarySoft,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing[4],
  },
});
