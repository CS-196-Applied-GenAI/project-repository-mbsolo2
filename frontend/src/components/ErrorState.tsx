/**
 * Full-block error state for screens (e.g. when a request fails and there’s nothing to show).
 * Use for loading failure, empty-after-error, or generic error with optional retry/action.
 */
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, spacing, textStyles } from '../theme';
import { PrimaryButton } from './PrimaryButton';

export interface ErrorStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function ErrorState({
  message,
  actionLabel,
  onAction,
  style,
}: ErrorStateProps) {
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
    color: colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing[4],
  },
});
