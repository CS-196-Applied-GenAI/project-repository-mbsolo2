import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, padding, textStyles } from '../theme';

export interface SectionHeaderProps {
  title: string;
  style?: ViewStyle;
}

/**
 * Bold section title (e.g. "Dietary Restrictions", "Best Matches"). Uses textStyles.sectionHeader.
 */
export function SectionHeader({ title, style }: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...padding.sectionHeader,
    backgroundColor: colors.surfaceSubtle,
  },
  title: {
    ...textStyles.sectionHeader,
    color: colors.text,
  },
});

/** Alias for SectionHeader */
export const SectionTitle = SectionHeader;
