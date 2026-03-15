import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { borders, colors, fontSizes, fontWeights, radius, semanticAccents, spacing } from '../theme';

export interface CTAFeatureCardProps {
  /** Main message (e.g. "We found 4 recipes you can make with your current ingredients") */
  message: string;
  /** Optional highlighted segment (e.g. "4 recipes"); rendered in accent green */
  highlight?: string;
  /** Optional action button (e.g. "Refresh") */
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

/**
 * Feature banner/card with optional green accent border and highlighted text (Figma: info banner).
 */
export function CTAFeatureCard({
  message,
  highlight,
  actionLabel,
  onAction,
  style,
}: CTAFeatureCardProps) {
  const parts = highlight != null && highlight !== '' && message.includes(highlight)
    ? message.split(highlight)
    : [message];

  return (
    <View style={[styles.card, style]}>
      <View style={styles.content}>
        <Text style={styles.message}>
          {parts.length > 1 ? (
            <>
              {parts[0]}
              <Text style={styles.highlight}>{highlight}</Text>
              {parts[1]}
            </>
          ) : (
            message
          )}
        </Text>
        {actionLabel != null && onAction != null && (
          <Pressable
            onPress={onAction}
            style={styles.action}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.successBackground,
    ...borders.accentGreen,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  message: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.text,
    marginRight: spacing[2],
  },
  highlight: {
    fontWeight: fontWeights.bold,
    color: semanticAccents.positive,
  },
  action: {
    minHeight: 44,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    justifyContent: 'center',
  },
  actionText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: semanticAccents.cta,
  },
});
