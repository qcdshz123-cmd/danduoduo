/**
 * 速订货 - Color System
 *
 * Linear/Apple-inspired palette: clean, restrained, high contrast.
 * Each color scale goes 50→900 with semantic aliases below.
 */

// ── Primary (Blue) ──────────────────────────────────────────
export const blue = {
  50:  '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',
  600: '#2563EB',  // ← Primary
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
} as const;

// ── Neutral (Gray) ──────────────────────────────────────────
export const gray = {
  50:  '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
  950: '#030712',
} as const;

// ── Semantic Colors ─────────────────────────────────────────
export const success = {
  light: '#ECFDF5',
  main: '#10B981',
  dark: '#065F46',
} as const;

export const warning = {
  light: '#FFFBEB',
  main: '#F59E0B',
  dark: '#92400E',
} as const;

export const danger = {
  light: '#FEF2F2',
  main: '#EF4444',
  dark: '#991B1B',
} as const;

export const info = {
  light: '#EFF6FF',
  main: '#3B82F6',
  dark: '#1E40AF',
} as const;

// ── Dark Mode Surface Colors ────────────────────────────────
export const darkSurface = {
  0: '#000000',
  1: '#0A0A0A',
  2: '#121212',
  3: '#1A1A1A',
  4: '#242424',
  5: '#2E2E2E',
} as const;

// ── Light Mode Surface Colors ───────────────────────────────
export const lightSurface = {
  0: '#FFFFFF',
  1: '#F9FAFB',
  2: '#F3F4F6',
  3: '#E5E7EB',
} as const;

// ── Semantic Aliases (used throughout the app) ──────────────
export const colors = {
  primary: blue[600],
  primaryLight: blue[500],
  primaryDark: blue[700],
  primaryBg: blue[50],

  // Text
  textPrimary: gray[900],
  textSecondary: gray[500],
  textTertiary: gray[400],
  textInverse: '#FFFFFF',

  // Backgrounds
  bgPrimary: lightSurface[0],
  bgSecondary: lightSurface[1],
  bgTertiary: lightSurface[2],

  // Borders
  borderLight: gray[200],
  borderDefault: gray[300],

  // Status (aliased for convenience)
  success: success.main,
  successBg: success.light,
  warning: warning.main,
  warningBg: warning.light,
  danger: danger.main,
  dangerBg: danger.light,
  info: info.main,
  infoBg: info.light,

  // Tab bar
  tabBarBg: 'rgba(255, 255, 255, 0.85)',
  tabBarBorder: 'rgba(0, 0, 0, 0.06)',
} as const;

// ── Dark Mode Colors ────────────────────────────────────────
export const darkColors = {
  primary: blue[500],
  primaryLight: blue[400],
  primaryDark: blue[600],
  primaryBg: 'rgba(59, 130, 246, 0.12)',

  textPrimary: gray[100],
  textSecondary: gray[400],
  textTertiary: gray[500],
  textInverse: gray[900],

  bgPrimary: darkSurface[0],
  bgSecondary: darkSurface[2],
  bgTertiary: darkSurface[3],

  borderLight: darkSurface[4],
  borderDefault: darkSurface[5],

  success: success.main,
  successBg: 'rgba(16, 185, 129, 0.12)',
  warning: warning.main,
  warningBg: 'rgba(245, 158, 11, 0.12)',
  danger: danger.main,
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  info: info.main,
  infoBg: 'rgba(59, 130, 246, 0.12)',

  tabBarBg: 'rgba(10, 10, 10, 0.88)',
  tabBarBorder: 'rgba(255, 255, 255, 0.08)',
} as const;

// ── Order Status Colors ─────────────────────────────────────
export const orderStatusColors = {
  pending:   { bg: gray[100],   text: gray[600],   dot: gray[400],   darkBg: darkSurface[4], darkText: gray[400] },
  confirmed: { bg: blue[50],    text: blue[600],   dot: blue[500],   darkBg: 'rgba(59,130,246,0.12)', darkText: blue[400] },
  shipped:   { bg: '#FFF7ED',   text: '#EA580C',   dot: '#F97316',   darkBg: 'rgba(249,115,22,0.12)', darkText: '#F97316' },
  completed: { bg: success.light, text: success.main, dot: success.main, darkBg: 'rgba(16,185,129,0.12)', darkText: success.main },
  cancelled: { bg: danger.light,  text: danger.main,  dot: danger.main,  darkBg: 'rgba(239,68,68,0.12)',  darkText: danger.main },
} as const;

// ── Stock Status Colors ─────────────────────────────────────
export const stockStatusColors = {
  normal:    { bg: success.light, text: success.dark, darkBg: 'rgba(16,185,129,0.12)', darkText: success.main },
  low:       { bg: warning.light, text: warning.dark, darkBg: 'rgba(245,158,11,0.12)', darkText: warning.main },
  critical:  { bg: danger.light,  text: danger.dark,  darkBg: 'rgba(239,68,68,0.12)',  darkText: danger.main },
  overstock: { bg: info.light,    text: info.dark,    darkBg: 'rgba(59,130,246,0.12)', darkText: info.main },
} as const;

export type ColorTokens = typeof colors;
export type DarkColorTokens = typeof darkColors;
