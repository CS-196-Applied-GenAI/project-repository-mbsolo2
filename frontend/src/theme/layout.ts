/**
 * Design system — reusable layout rules and constants
 * Flex helpers, screen padding, navbar height. Use with StyleSheet or inline.
 */
import { ViewStyle } from 'react-native';
import { spacing } from './spacing';

/** Horizontal padding from screen edges (mobile-first) */
export const screenPaddingHorizontal = spacing[4];

/** Approximate height of bottom tab bar for layout calculations */
export const navbarHeight = 56;

export const layout = {
  /** Full flex for screens */
  flex1: { flex: 1 } as ViewStyle,
  /** Row with centered cross axis */
  row: { flexDirection: 'row' as const },
  rowCenter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  rowBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  /** Center content */
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  /** Standard screen container (flex + horizontal padding) */
  screen: {
    flex: 1,
    paddingHorizontal: screenPaddingHorizontal,
  } as ViewStyle,
  /** List/content area without horizontal padding when full-bleed */
  content: {
    flex: 1,
  } as ViewStyle,
  /** Gap between items in a row/column */
  gap: (n: keyof typeof spacing) => ({ gap: spacing[n] }),
} as const;

export type Layout = typeof layout;
