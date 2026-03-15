/**
 * Design system — border radius
 */
export const radius = {
  none: 0,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
  /** Pill shape for chips/tabs */
  pill: 20,
} as const;

export type Radius = typeof radius;
