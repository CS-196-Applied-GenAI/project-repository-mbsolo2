/**
 * Cookbook app — centralized design system
 *
 * Import what you need:
 *   import { colors, spacing, radius, semanticAccents, iconColors } from '../theme';
 *   import { theme } from '../theme';
 */
import { colors, semanticAccents } from './colors';
import { fontSizes, fontWeights, lineHeights, textStyles } from './typography';
import { padding, spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { layout } from './layout';
import { borders, borderWidth } from './borders';
import {
  iconColors,
  toggleColors,
  chipColors,
  progressColors,
  tagColors,
} from './accents';

export { colors, accentOrder, semanticAccents } from './colors';
export type { Colors, SemanticAccents } from './colors';

export {
  fontSizes,
  fontWeights,
  lineHeights,
  textStyles,
} from './typography';
export type {
  FontSizes,
  FontWeights,
  TextStyles,
} from './typography';

export { spacing, padding } from './spacing';
export type { Spacing, Padding } from './spacing';

export { radius } from './radius';
export type { Radius } from './radius';

export { shadows } from './shadows';
export type { Shadows } from './shadows';

export { borderWidth, borders } from './borders';
export type { BorderWidth, Borders } from './borders';

export {
  iconColors,
  toggleColors,
  chipColors,
  progressColors,
  tagColors,
} from './accents';
export type {
  IconColors,
  ToggleColors,
  ChipColors,
  ProgressColors,
  TagColors,
} from './accents';

export { layout, screenPaddingHorizontal, navbarHeight } from './layout';
export type { Layout } from './layout';

/** Single theme object for convenience */
export const theme = {
  colors,
  semanticAccents,
  fontSizes,
  fontWeights,
  lineHeights,
  textStyles,
  spacing,
  padding,
  radius,
  shadows,
  borders,
  borderWidth,
  layout,
  iconColors,
  toggleColors,
  chipColors,
  progressColors,
  tagColors,
};
