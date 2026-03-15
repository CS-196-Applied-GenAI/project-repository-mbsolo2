import React, { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fontSizes, fontWeights, radius, semanticAccents, shadows, spacing, textStyles } from '../theme';

export interface StatCardProps {
  /** Optional icon or accent indicator (e.g. colored icon) */
  icon?: ReactNode;
  /** Accent color for icon or left border (default: cta) */
  accentColor?: string;
  /** Label below value (e.g. "Recipes Saved") */
  label: string;
  /** Main stat value */
  value: number | string;
  style?: ViewStyle;
}

/**
 * Stat card for Profile or dashboards: optional icon, value, label. Uses design system shadows and radius.
 */
export function StatCard({
  icon,
  accentColor = semanticAccents.cta,
  label,
  value,
  style,
}: StatCardProps) {
  return (
    <View style={[styles.card, style]}>
      {icon != null && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={[styles.value, accentColor ? { color: accentColor } : null]}>
        {typeof value === 'number' ? value : value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing[4],
    minWidth: 96,
    alignItems: 'center',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  iconWrap: {
    marginBottom: spacing[2],
  },
  value: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  label: {
    ...textStyles.bodySmall,
    color: colors.textSecondarySoft,
    marginTop: spacing[1],
    textAlign: 'center',
  },
});
