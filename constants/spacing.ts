/**
 * 4px baseline spacing scale.
 */

export const spacing = {
  0:  0,
  0.5: 2,
  1:  4,
  1.5: 6,
  2:  8,
  2.5: 10,
  3:  12,
  3.5: 14,
  4:  16,
  5:  20,
  6:  24,
  7:  28,
  8:  32,
  9:  36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// ── Common layout values ────────────────────────────────────
export const layout = {
  screenPadding: spacing[4],      // 16px horizontal padding
  cardPadding: spacing[4],        // 16px card internal padding
  cardGap: spacing[3],            // 12px gap between cards
  listGap: spacing[2],            // 8px gap between list items
  sectionGap: spacing[6],         // 24px gap between sections
  iconSize: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
  avatarSize: {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  },
  buttonHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  inputHeight: 48,
  tabBarHeight: 56,
  headerHeight: 52,
  fabSize: 56,
} as const;
