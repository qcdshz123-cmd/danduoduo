import { colors, darkColors, orderStatusColors, stockStatusColors } from './colors';
import { fontFamily, fontSize, fontWeight, lineHeight, textStyles } from './typography';
import { spacing, borderRadius, layout } from './spacing';
import { shadows, darkShadows } from './shadows';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: 'light' | 'dark';
  colors: typeof colors | typeof darkColors;
  text: typeof textStyles;
  font: { family: typeof fontFamily; size: typeof fontSize; weight: typeof fontWeight; line: typeof lineHeight };
  space: typeof spacing;
  radius: typeof borderRadius;
  layout: typeof layout;
  shadows: typeof shadows | typeof darkShadows;
  orderStatus: typeof orderStatusColors;
  stockStatus: typeof stockStatusColors;
  isDark: boolean;
}

export const lightTheme: Theme = {
  mode: 'light',
  colors,
  text: textStyles,
  font: { family: fontFamily, size: fontSize, weight: fontWeight, line: lineHeight },
  space: spacing,
  radius: borderRadius,
  layout,
  shadows,
  orderStatus: orderStatusColors,
  stockStatus: stockStatusColors,
  isDark: false,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  text: textStyles,
  font: { family: fontFamily, size: fontSize, weight: fontWeight, line: lineHeight },
  space: spacing,
  radius: borderRadius,
  layout,
  shadows: darkShadows,
  orderStatus: orderStatusColors,
  stockStatus: stockStatusColors,
  isDark: true,
};

export const getTheme = (mode: 'light' | 'dark'): Theme =>
  mode === 'dark' ? darkTheme : lightTheme;
