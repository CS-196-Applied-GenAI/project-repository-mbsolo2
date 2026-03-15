# Design System

Centralized tokens for the Cookbook app: white background, black primary text, soft gray secondary text, rainbow-accent system, rounded corners, subtle borders/shadows, bold section headers, generous spacing, mobile-first layout.

## 1. Color tokens

**Surfaces:** `colors.background`, `colors.surface`, `colors.surfaceSubtle`, `colors.surfaceOverlay`

**Text:** `colors.text` (black), `colors.textSecondary`, `colors.textSecondarySoft` (soft gray), `colors.textTertiary`, `colors.textInverse`

**Borders/dividers:** `colors.border`, `colors.borderLight`, `colors.divider`

**Rainbow accents (raw):** `colors.accentRed`, `accentOrange`, `accentYellow`, `accentGreen`, `accentTeal`, `accentBlue`, `accentViolet`, `accentPink`, `accentLavender`, `accentLavenderLight`

**Semantic accents:** Prefer these for consistent UI:

- `semanticAccents.cta` — primary CTA, active nav, toggle on
- `semanticAccents.activity` — cooked/activity metrics
- `semanticAccents.positive` — positive tags, easy, matched ingredients
- `semanticAccents.chip` / `chipLight` — chips, secondary tinted surfaces
- `semanticAccents.destructive` — logout, destructive actions, favorites emphasis
- `semanticAccents.inactive` — inactive icons, toggle off

**Cycling:** `accentOrder` — array of accent hex values for cycling through chips/stats.

## 2. Typography tokens

**Sizes:** `fontSizes.xs` … `fontSizes['3xl']`

**Weights:** `fontWeights.normal`, `medium`, `semibold`, `bold`

**Preset styles:** `textStyles.titleLarge`, `title`, `titleSmall`, `heading`, `sectionHeader`, `body`, `bodySmall`, `caption`, `label`, `button`

Use `sectionHeader` for bold section titles (e.g. "Dietary Restrictions", "Best Matches"). Use `heading` for slightly smaller bold headings.

## 3. Spacing scale

**Base scale (4px):** `spacing[0]` … `spacing[12]` (0, 4, 8, 12, 16, 20, 24, 32, 40, 48)

**Presets:** `padding.screen`, `padding.card`, `padding.sectionHeader`, `padding.header`, `padding.buttonSm` / `buttonMd` / `buttonLg`, etc.

Use for padding, margin, and gap. Prefer the scale over magic numbers.

## 4. Border radius scale

`radius.none`, `radius.sm` (6), `radius.md` (8), `radius.lg` (12), `radius.xl` (16), `radius.full`, `radius.pill` (20, chips/tabs)

Use `radius.lg` for cards, `radius.pill` for chips.

## 5. Shadow / border tokens

**Shadows:** `shadows.none`, `shadows.sm`, `shadows.md`, `shadows.lg` — use for cards and elevated surfaces.

**Borders:** `borders.hairlineGray`, `borders.light`, `borders.card`, `borders.accentGreen`, `borders.dashedPlaceholder`

**Widths:** `borderWidth.hairline`, `borderWidth.thin`, `borderWidth.medium`

Spread into style objects, e.g. `style={[styles.card, borders.light]}`.

## 6. Layout constants

- `screenPaddingHorizontal` — horizontal padding from screen edges (16)
- `navbarHeight` — bottom tab bar height (56)
- `layout.flex1`, `layout.row`, `layout.rowCenter`, `layout.rowBetween`, `layout.center`, `layout.screen`, `layout.content`
- `layout.gap(n)` — gap using spacing scale key

## 7. Icon / accent mapping

Use for icons, toggles, chips, progress bars, tags:

- **Icons:** `iconColors.active`, `inactive`, `destructive`, `positive`, `activity`
- **Toggles:** `toggleColors.on`, `toggleColors.off`
- **Chips:** `chipColors.selected`, `background`, `tag`, `placeholder`
- **Progress:** `progressColors.fill`, `progressColors.track`
- **Tags:** `tagColors.positive`, `tagColors.default`

Example: active nav icon `color={iconColors.active}`, logout icon `color={iconColors.destructive}`, easy tag text `color={tagColors.positive}`.

---

## How screens should consume the design system

1. **Import from `../theme` (or `@/theme`):** Pull only what you need, e.g. `colors`, `spacing`, `radius`, `textStyles`, `semanticAccents`, `iconColors`, `borders`, `layout`.

2. **Prefer semantic tokens:** Use `semanticAccents.cta` instead of `colors.accentBlue` for CTAs so the system can change in one place. Use `iconColors`, `chipColors`, etc. for consistent icon and chip styling.

3. **Use text styles:** Apply `textStyles.sectionHeader` for section titles, `textStyles.body` for body copy, and spread into `Text` style: `style={[textStyles.sectionHeader, { color: colors.text }]}`.

4. **Use spacing scale:** Use `spacing[4]` instead of `16`; use `padding.sectionHeader` for section header padding.

5. **Cards:** Combine `radius.lg`, `borders.light` or `borders.card`, and `shadows.sm` for card-style containers.

6. **No hardcoded hex:** Avoid new hex values in screens; add a token to the theme if a new use case appears.
