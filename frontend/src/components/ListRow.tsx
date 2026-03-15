import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { borders, colors, fontSizes, fontWeights, screenPaddingHorizontal, spacing, textStyles } from '../theme';

export interface ListRowProps {
  /** Optional left icon or element */
  left?: ReactNode;
  /** Main label (primary text) */
  label: string;
  /** Optional right content (e.g. toggle, chevron, value) */
  right?: ReactNode;
  /** Optional hint below label (secondary text) */
  hint?: string;
  onPress?: () => void;
  /** Show bottom border (default true) */
  showBorder?: boolean;
  style?: ViewStyle;
}

/**
 * Single row for settings/cuisine lists: optional icon, label, optional hint, optional right control.
 */
export function ListRow({
  left,
  label,
  right,
  hint,
  onPress,
  showBorder = true,
  style,
}: ListRowProps) {
  const content = (
    <>
      {left != null && <View style={styles.left}>{left}</View>}
      <View style={styles.center}>
        <Text style={styles.label}>{label}</Text>
        {hint != null && hint !== '' && (
          <Text style={styles.hint}>{hint}</Text>
        )}
      </View>
      {right != null && <View style={styles.right}>{right}</View>}
    </>
  );

  const rowStyle = [styles.row, showBorder && borders.hairlineGray, style];

  if (onPress) {
    return (
      <Pressable style={rowStyle} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
        {content}
      </Pressable>
    );
  }

  return <View style={rowStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: screenPaddingHorizontal,
    backgroundColor: colors.surface,
  },
  left: {
    marginRight: spacing[3],
  },
  center: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    ...textStyles.body,
    fontWeight: fontWeights.medium,
    color: colors.text,
  },
  hint: {
    ...textStyles.caption,
    color: colors.textSecondarySoft,
    marginTop: spacing[1],
  },
  right: {
    marginLeft: spacing[2],
  },
});
