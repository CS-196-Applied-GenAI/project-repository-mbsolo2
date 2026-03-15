import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors, layout, screenPaddingHorizontal } from '../theme';

export interface ScreenContainerProps {
  children: ReactNode;
  /** If true, adds horizontal padding (default: false for full-bleed lists) */
  padded?: boolean;
  style?: ViewStyle;
}

/**
 * Full-screen container: white background, flex 1.
 * Use padded for screens that need horizontal inset; omit for full-bleed lists.
 */
export function ScreenContainer({
  children,
  padded = false,
  style,
}: ScreenContainerProps) {
  return (
    <View style={[styles.container, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...layout.flex1,
    backgroundColor: colors.background,
  },
  padded: {
    paddingHorizontal: screenPaddingHorizontal,
  },
});

/** Alias for ScreenContainer when documenting app-level screens */
export const AppScreen = ScreenContainer;