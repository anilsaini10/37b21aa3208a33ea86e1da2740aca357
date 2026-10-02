/**
 * Typography system.
 *
 * Font sizes / line-heights are multiplied by an accessibility `scale` at
 * runtime so users can enlarge text globally. `buildTypography` produces a
 * scaled typography object for a given base + scale factor.
 */
import type {ThemeTypography, FontSizeSet} from './types';

/**
 * Inter (see `src/assets/fonts/Inter`), linked natively via
 * `react-native.config.js` + `npx react-native-asset`. File names double as
 * the PostScript names so `fontFamily` resolves identically on iOS and
 * Android without relying on the `fontWeight` style prop.
 */
const interFont = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
};

const baseFontSize: FontSizeSet = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 40,
};

const baseLineHeight: FontSizeSet = {
  xs: 16,
  sm: 18,
  md: 22,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 38,
  display: 48,
};

const scaleSet = (set: FontSizeSet, scale: number): FontSizeSet => ({
  xs: Math.round(set.xs * scale),
  sm: Math.round(set.sm * scale),
  md: Math.round(set.md * scale),
  lg: Math.round(set.lg * scale),
  xl: Math.round(set.xl * scale),
  xxl: Math.round(set.xxl * scale),
  xxxl: Math.round(set.xxxl * scale),
  display: Math.round(set.display * scale),
});

/**
 * Build a typography token set.
 * @param fontFamily Optional override of the four weight variants.
 * @param scale Accessibility scale factor (0.85 – 1.4 recommended).
 */
export function buildTypography(
  fontFamily?: Partial<ThemeTypography['fontFamily']>,
  scale = 1,
): ThemeTypography {
  const clampedScale = Math.min(Math.max(scale, 0.75), 1.6);
  return {
    fontFamily: {
      regular: fontFamily?.regular ?? interFont.regular,
      medium: fontFamily?.medium ?? interFont.medium,
      semibold: fontFamily?.semibold ?? interFont.semibold,
      bold: fontFamily?.bold ?? interFont.bold,
    },
    fontSize: scaleSet(baseFontSize, clampedScale),
    lineHeight: scaleSet(baseLineHeight, clampedScale),
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      bold8: '800',
      bold9: '900',
    },
    scale: clampedScale,
  };
}

export const typography = buildTypography();
