import { Platform } from 'react-native';

/**
 * Shadow presets — subtle, layered, Apple-style.
 * iOS uses shadowColor + shadowOffset + shadowOpacity + shadowRadius.
 * Android uses elevation.
 */

type Shadow = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

const createShadow = (
  y: number,
  blur: number,
  opacity: number,
  elevation: number,
): Shadow => ({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: y },
  shadowOpacity: opacity,
  shadowRadius: blur,
  elevation,
});

export const shadows = {
  none: Platform.select<Shadow>({
    ios: createShadow(0, 0, 0, 0),
    android: { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
    default: createShadow(0, 0, 0, 0),
  })!,

  xs: createShadow(1, 2, 0.04, 0.5),
  sm: createShadow(1, 3, 0.06, 1),
  md: createShadow(2, 8, 0.08, 3),
  lg: createShadow(4, 16, 0.1, 6),
  xl: createShadow(8, 24, 0.12, 10),
  '2xl': createShadow(12, 40, 0.15, 16),

  // FAB shadow — more dramatic lift
  fab: Platform.select<Shadow>({
    ios: createShadow(4, 12, 0.18, 0),
    android: createShadow(4, 12, 0.18, 8),
    default: createShadow(4, 12, 0.18, 8),
  })!,

  // Card hover / pressed effect
  cardPressed: createShadow(1, 3, 0.06, 1),

  // Modal / bottom sheet
  modal: createShadow(0, 32, 0.24, 24),
} as const;

/**
 * Android-specific — shadow should be darker on dark backgrounds.
 * Use this when a light-colored card is on a dark background.
 */
export const darkShadows = {
  ...shadows,
  // On dark mode, cards need more visible separation
  sm: createShadow(1, 3, 0.15, 1),
  md: createShadow(2, 8, 0.2, 3),
  lg: createShadow(4, 16, 0.25, 6),
};

export type ShadowLevel = keyof typeof shadows;
