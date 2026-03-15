/**
 * Design system — icon and accent color mapping
 * Map UI roles to colors for a consistent rainbow-accent interface.
 * Use when styling icons, toggles, chips, progress bars, and tags.
 */
import { colors, semanticAccents } from './colors';

export const iconColors = {
  /** Active nav item, primary action icon, toggle on */
  active: semanticAccents.cta,
  /** Inactive nav, secondary icons (clock, chef hat outline), toggle off */
  inactive: colors.textTertiary,
  /** Destructive (logout arrow), favorites heart when emphasized */
  destructive: semanticAccents.destructive,
  /** Positive indicator (easy tag, match count, checkmark) */
  positive: semanticAccents.positive,
  /** Activity/cooked metric icon */
  activity: semanticAccents.activity,
} as const;

export const toggleColors = {
  on: semanticAccents.cta,
  off: colors.borderLight,
} as const;

export const chipColors = {
  /** Selected chip background */
  selected: semanticAccents.cta,
  /** Unselected chip background (subtle tint) */
  background: colors.surfaceSubtle,
  /** Lavender tint for tag-style chips (e.g. Vegetarian, Gluten Free) */
  tag: semanticAccents.chipLight,
  /** Dashed "+ Add" chip border and text */
  placeholder: colors.textTertiary,
} as const;

export const progressColors = {
  fill: semanticAccents.cta,
  track: colors.borderLight,
} as const;

export const tagColors = {
  /** Easy, matched count, success */
  positive: semanticAccents.positive,
  /** Generic tag tint */
  default: semanticAccents.chipLight,
} as const;

export type IconColors = typeof iconColors;
export type ToggleColors = typeof toggleColors;
export type ChipColors = typeof chipColors;
export type ProgressColors = typeof progressColors;
export type TagColors = typeof tagColors;
