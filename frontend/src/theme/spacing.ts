/**
 * Design system — spacing
 * 4px base scale. Use for padding, margin, gaps.
 */
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

/** Common padding/margin presets */
export const padding = {
  screen: spacing[4],
  card: spacing[4],
  cardCompact: spacing[3],
  sectionHeader: { paddingVertical: spacing[2], paddingHorizontal: spacing[4] },
  header: { paddingVertical: spacing[3], paddingHorizontal: spacing[4] },
  modal: spacing[4],
  modalBottom: spacing[8],
  input: spacing[3],
  buttonSm: { paddingVertical: spacing[2], paddingHorizontal: spacing[3] },
  buttonMd: { paddingVertical: spacing[3], paddingHorizontal: spacing[4] },
  buttonLg: { paddingVertical: spacing[3], paddingHorizontal: spacing[5] },
} as const;

export type Spacing = typeof spacing;
export type Padding = typeof padding;
