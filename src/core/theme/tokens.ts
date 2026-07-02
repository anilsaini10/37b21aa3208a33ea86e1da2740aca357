/**
 * Primitive design tokens shared by every theme.
 *
 * Spacing / radius are theme-agnostic scales. Colours live in `themes.ts`
 * because they differ between light, dark and custom school themes.
 */
import type {ThemeSpacing, ThemeRadius} from './types';

export const spacing: ThemeSpacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius: ThemeRadius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
};

/** Raw colour palette used to compose semantic theme colours. */
export const palette = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Brand (indigo)
  indigo50: '#EEF2FF',
  indigo100: '#E0E7FF',
  indigo400: '#818CF8',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  indigo700: '#4338CA',

  // Emerald (custom school theme)
  emerald400: '#34D399',
  emerald500: '#10B981',
  emerald600: '#059669',

  // Amber (custom school theme)
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amber600: '#D97706',

  // Semantic
  green500: '#22C55E',
  red500: '#EF4444',
  orange500: '#F97316',
  blue500: '#3B82F6',

  // Neutrals
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  gray950: '#0B1220',
} as const;
