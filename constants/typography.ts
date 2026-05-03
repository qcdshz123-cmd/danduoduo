import { TextStyle } from 'react-native';

/**
 * Typography system — SF Pro Display (headings) + Inter (body).
 * Uses system font on device; falls back gracefully.
 */

export const fontFamily = {
  display: {
    bold: 'System',
    medium: 'System',
    regular: 'System',
  },
  body: {
    bold: 'System',
    medium: 'System',
    regular: 'System',
  },
  mono: {
    regular: 'Menlo',
  },
} as const;

// ── Font Sizes (px) ─────────────────────────────────────────
export const fontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   19,
  xl:   22,
  '2xl': 26,
  '3xl': 32,
  '4xl': 38,
} as const;

// ── Font Weights ────────────────────────────────────────────
export const fontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium:  '500' as TextStyle['fontWeight'],
  semibold:'600' as TextStyle['fontWeight'],
  bold:    '700' as TextStyle['fontWeight'],
} as const;

// ── Line Heights ────────────────────────────────────────────
export const lineHeight = {
  tight:  1.15,
  snug:   1.3,
  normal: 1.5,
  relaxed: 1.7,
} as const;

// ── Preset Text Styles ──────────────────────────────────────
export const textStyles = {
  // Display
  h1: {
    fontFamily: fontFamily.display.bold,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['3xl'] * lineHeight.tight,
    letterSpacing: -0.5,
  } as TextStyle,

  h2: {
    fontFamily: fontFamily.display.bold,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['2xl'] * lineHeight.tight,
    letterSpacing: -0.3,
  } as TextStyle,

  h3: {
    fontFamily: fontFamily.display.medium,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xl * lineHeight.snug,
  } as TextStyle,

  // Body
  body: {
    fontFamily: fontFamily.body.regular,
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.base * lineHeight.normal,
  } as TextStyle,

  bodyMedium: {
    fontFamily: fontFamily.body.medium,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.base * lineHeight.normal,
  } as TextStyle,

  bodySmall: {
    fontFamily: fontFamily.body.regular,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.sm * lineHeight.normal,
  } as TextStyle,

  // Caption
  caption: {
    fontFamily: fontFamily.body.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.xs * lineHeight.normal,
  } as TextStyle,

  captionMedium: {
    fontFamily: fontFamily.body.medium,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.xs * lineHeight.normal,
  } as TextStyle,

  // Price (tabular figures for alignment)
  price: {
    fontFamily: fontFamily.body.bold,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.md * lineHeight.snug,
  } as TextStyle,

  priceLg: {
    fontFamily: fontFamily.body.bold,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['2xl'] * lineHeight.tight,
    letterSpacing: -0.5,
  } as TextStyle,

  // Button
  button: {
    fontFamily: fontFamily.body.medium,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.base * lineHeight.snug,
    letterSpacing: 0.1,
  } as TextStyle,

  buttonSmall: {
    fontFamily: fontFamily.body.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * lineHeight.snug,
  } as TextStyle,

  // Tab
  tab: {
    fontFamily: fontFamily.body.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.xs * lineHeight.normal,
  } as TextStyle,

  tabActive: {
    fontFamily: fontFamily.body.medium,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.xs * lineHeight.normal,
  } as TextStyle,

  // Mono (SKU, barcode, codes)
  mono: {
    fontFamily: fontFamily.mono.regular,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.sm * lineHeight.normal,
  } as TextStyle,
} as const;
