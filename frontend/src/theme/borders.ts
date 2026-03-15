/**
 * Design system — border tokens
 * Use for dividers, card outlines, info banners, and dashed placeholders.
 */
import { StyleSheet } from 'react-native';

import { colors } from './colors';

/** Border widths */
export const borderWidth = {
  none: 0,
  hairline: StyleSheet.hairlineWidth,
  thin: 1,
  medium: 2,
} as const;

/** Border color + width presets for common use */
export const borders = {
  /** Subtle separator between list items / sections */
  hairlineGray: {
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.divider,
  },
  /** Light gray border for cards and inputs */
  light: {
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
  },
  /** Default card/container border */
  card: {
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  /** Green accent border (e.g. info banner "We found N recipes") */
  accentGreen: {
    borderWidth: borderWidth.thin,
    borderColor: colors.accentGreen,
  },
  /** Dashed placeholder (e.g. "+ Add" chip) */
  dashedPlaceholder: {
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderStyle: 'dashed' as const,
  },
} as const;

export type BorderWidth = typeof borderWidth;
export type Borders = typeof borders;
