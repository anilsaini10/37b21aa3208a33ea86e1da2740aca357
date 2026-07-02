/**
 * Theme type definitions.
 *
 * The theme is a fully-typed token tree consumed by every component through the
 * `useTheme()` hook. Swapping the active `Theme` object at runtime re-styles the
 * whole app (light / dark / custom school themes) without touching component code.
 */

export type ThemeMode = 'light' | 'dark' | 'system';

/** Semantic colour palette. Every colour a component may need lives here. */
export interface ThemeColors {
  primary: string;
  primaryVariant: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  divider: string;
  notification: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  disabled: string;
  placeholder: string;
  overlay: string;
  shadow: string;
  inputBackground: string;
  headerBackground: string;
  tabActive: string;
  tabInactive: string;
  skeleton: string;
}

export interface ThemeSpacing {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

export interface ThemeRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  pill: number;
}

export interface FontFamilySet {
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
}

export interface FontSizeSet {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  display: number;
}

export interface FontWeightSet {
  regular: '400';
  medium: '500';
  semibold: '600';
  bold: '700';
}

export interface ThemeTypography {
  fontFamily: FontFamilySet;
  fontSize: FontSizeSet;
  fontWeight: FontWeightSet;
  lineHeight: FontSizeSet;
  /** Multiplier applied for accessibility font scaling (1 = default). */
  scale: number;
}

/** Component-level design tokens derived from the primitives above. */
export interface ComponentTokens {
  button: {
    height: number;
    radius: number;
    paddingHorizontal: number;
    fontSize: number;
  };
  input: {
    height: number;
    radius: number;
    paddingHorizontal: number;
    fontSize: number;
    borderWidth: number;
  };
  card: {
    radius: number;
    padding: number;
    elevation: number;
  };
  header: {
    height: number;
    fontSize: number;
  };
  tab: {
    height: number;
    fontSize: number;
    iconSize: number;
  };
}

export type IconPack = 'material' | 'fontawesome' | 'custom';

export interface Theme {
  /** Stable identifier, e.g. 'light', 'dark', 'school-emerald'. */
  key: string;
  name: string;
  dark: boolean;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  typography: ThemeTypography;
  components: ComponentTokens;
  iconPack: IconPack;
}
