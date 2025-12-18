/**
 * Theme system exports for Homezy mobile app
 */

export { colors } from './colors';
export type { Colors } from './colors';

export { fontFamily, fontSize, lineHeight, fontWeight, textStyles } from './typography';
export type { TextStyles } from './typography';

export { spacing, borderRadius, shadows, layout } from './spacing';
export type { Spacing, BorderRadius, Shadows } from './spacing';

// Combined theme object for easy access
import { colors } from './colors';
import { fontFamily, fontSize, lineHeight, fontWeight, textStyles } from './typography';
import { spacing, borderRadius, shadows, layout } from './spacing';

export const theme = {
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  textStyles,
  spacing,
  borderRadius,
  shadows,
  layout,
} as const;

export type Theme = typeof theme;
