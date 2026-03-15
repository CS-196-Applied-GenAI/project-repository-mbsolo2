import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fontSizes, fontWeights, screenPaddingHorizontal, spacing, textStyles } from '../theme';

export interface AppHeaderProps {
  /** Optional back button label (e.g. "Back"); when set, renders a pressable back control */
  backLabel?: string;
  onBack?: () => void;
  /** Main title (bold black) */
  title: string;
  /** Optional subtitle (soft gray) */
  subtitle?: string;
  /** Optional right-side content (e.g. "+ Add" button) */
  right?: ReactNode;
  style?: ViewStyle;
}

/**
 * Standard app screen header: optional back, title, subtitle, optional right action.
 * Uses design system typography and spacing.
 */
export function AppHeader({
  backLabel = 'Back',
  onBack,
  title,
  subtitle,
  right,
  style,
}: AppHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      {onBack != null && (
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
        >
          <Text style={styles.backText}>{backLabel}</Text>
        </Pressable>
      )}
      <View style={styles.titleBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle != null && subtitle !== '' && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {right != null && <View style={styles.right}>{right}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: screenPaddingHorizontal,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surface,
  },
  backButton: {
    minHeight: 44,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    justifyContent: 'center',
    marginRight: spacing[2],
  },
  backText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.accentBlue,
  },
  titleBlock: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  title: {
    ...textStyles.title,
    color: colors.text,
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondarySoft,
    marginTop: spacing[1],
  },
  right: {
    marginLeft: spacing[2],
  },
});
