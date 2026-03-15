/**
 * Design system — shadows
 * React Native shadow props (iOS: shadow*, Android: elevation).
 * Use sparingly for cards, modals, floating elements.
 */
import { Platform, ViewStyle } from 'react-native';

export const shadows = {
  none: {},
  sm: (Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
    },
    android: { elevation: 2 },
    default: {},
  }) ?? {}) as ViewStyle,
  md: (Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: { elevation: 3 },
    default: {},
  }) ?? {}) as ViewStyle,
  lg: (Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: { elevation: 8 },
    default: {},
  }) ?? {}) as ViewStyle,
} as const;

export type Shadows = typeof shadows;
