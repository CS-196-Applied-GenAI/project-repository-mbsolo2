/**
 * Inline error banner for forms or lists (dismiss and optional retry).
 * Keeps error messaging and actions consistent across screens.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fontSizes, fontWeights, spacing } from '../theme';

export interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  retryLabel?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorBanner({
  message,
  onDismiss,
  retryLabel = 'Retry',
  onRetry,
  style,
}: ErrorBannerProps) {
  return (
    <View style={[styles.banner, style]}>
      <Text style={styles.message} numberOfLines={3}>
        {message}
      </Text>
      <View style={styles.actions}>
        {onRetry != null && (
          <Pressable onPress={onRetry} style={styles.action} accessibilityRole="button">
            <Text style={styles.actionText}>{retryLabel}</Text>
          </Pressable>
        )}
        {onDismiss != null && (
          <Pressable onPress={onDismiss} style={styles.action} accessibilityRole="button">
            <Text style={styles.actionText}>Dismiss</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.errorBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.error,
  },
  message: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.error,
    marginRight: spacing[2],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  action: {
    minHeight: 44,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    justifyContent: 'center',
  },
  actionText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.accentBlue,
  },
});
