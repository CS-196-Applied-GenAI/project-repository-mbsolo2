/**
 * Design system — colors
 * White background, black text, rainbow-accent design language.
 * Use accents for chips, icons, stats, badges, and CTAs.
 */
export const colors = {
  // Surfaces — white / near-white
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F8F8F8',
  surfaceOverlay: 'rgba(0,0,0,0.4)',

  // Borders & dividers — light
  border: '#EBEBEB',
  borderLight: '#F0F0F0',
  divider: '#E8E8E8',

  // Primary CTA — one accent (blue) for main buttons
  primary: '#2563EB',
  primaryPressed: '#1D4ED8',

  // Text — black and soft grays (Figma: black primary, soft gray secondary)
  text: '#000000',
  textSecondary: '#444444',
  textSecondarySoft: '#888888',
  textTertiary: '#737373',
  textInverse: '#FFFFFF',

  // Rainbow accents — raw palette
  accentRed: '#DC2626',
  accentOrange: '#EA580C',
  accentYellow: '#CA8A04',
  accentGreen: '#16A34A',
  accentTeal: '#0D9488',
  accentBlue: '#2563EB',
  accentViolet: '#7C3AED',
  accentPink: '#DB2777',
  /** Lavender for chips and secondary tinted surfaces (Figma) */
  accentLavender: '#E8E0F6',
  /** Light lavender background for chips / numbered badges */
  accentLavenderLight: '#F3EFFA',

  // Semantic (unchanged for errors/warnings)
  success: '#16A34A',
  successBackground: '#ECFDF5',
  warning: '#EA580C',
  warningBackground: '#FFF7ED',
  error: '#DC2626',
  errorBackground: '#FEF2F2',
  info: '#2563EB',
  infoBackground: '#EFF6FF',
  infoBorder: '#BFDBFE',

  offlineBanner: '#EA580C',
} as const;

/** Ordered rainbow palette for cycling (chips, stats). */
export const accentOrder: readonly string[] = [
  colors.accentRed,
  colors.accentOrange,
  colors.accentYellow,
  colors.accentGreen,
  colors.accentTeal,
  colors.accentBlue,
  colors.accentViolet,
  colors.accentPink,
];

/**
 * Semantic accent mapping — use these for consistent rainbow-style UI.
 * - primary/CTA/active nav → blue
 * - activity/cooked metrics → orange
 * - positive/easy/matched → green
 * - chips/secondary surfaces → lavender
 * - destructive/logout/favorites → red/pink
 */
export const semanticAccents = {
  /** Primary CTA, active nav tab, toggle on state */
  cta: colors.accentBlue,
  /** Activity metrics (e.g. recipes cooked) */
  activity: colors.accentOrange,
  /** Positive tags, easy difficulty, matched ingredients, success count */
  positive: colors.accentGreen,
  /** Chips, secondary tinted surfaces, numbered badges */
  chip: colors.accentLavender,
  chipLight: colors.accentLavenderLight,
  /** Destructive actions (logout), favorites heart */
  destructive: colors.accentPink,
  /** Inactive icons, toggle off track, placeholder borders */
  inactive: colors.textTertiary,
} as const;

export type Colors = typeof colors;
export type SemanticAccents = typeof semanticAccents;
