/**
 * Concrete themes: light, dark, and two custom "school" themes.
 *
 * `THEMES` is the registry the ThemeService reads from. New school brands can
 * be added here (or fetched from an API) without changing any component.
 */
import {palette, spacing, radius} from './tokens';
import {buildTypography} from './typography';
import type {Theme, ComponentTokens} from './types';

const components = (radiusScale = 1): ComponentTokens => ({
  button: {
    height: 50,
    radius: radius.md * radiusScale,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  input: {
    height: 50,
    radius: radius.md * radiusScale,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    borderWidth: 1,
  },
  card: {
    radius: radius.lg * radiusScale,
    padding: spacing.lg,
    elevation: 2,
  },
  header: {
    height: 56,
    fontSize: 18,
  },
  tab: {
    height: 60,
    fontSize: 11,
    iconSize: 22,
  },
});

export const lightTheme: Theme = {
  key: 'light',
  name: 'Light',
  dark: false,
  iconPack: 'material',
  spacing,
  radius,
  typography: buildTypography(),
  components: components(),
  colors: {
    primary: palette.indigo600,
    primaryVariant: palette.indigo700,
    onPrimary: palette.white,
    secondary: palette.amber500,
    onSecondary: palette.gray900,
    background: palette.gray50,
    surface: palette.white,
    surfaceVariant: palette.gray100,
    card: palette.white,
    text: palette.gray900,
    textSecondary: palette.gray600,
    textMuted: palette.gray400,
    border: palette.gray200,
    divider: palette.gray200,
    notification: palette.red500,
    error: palette.red500,
    success: palette.green500,
    warning: palette.orange500,
    info: palette.blue500,
    disabled: palette.gray300,
    placeholder: palette.gray400,
    overlay: 'rgba(17, 24, 39, 0.45)',
    shadow: palette.black,
    inputBackground: palette.white,
    headerBackground: palette.white,
    tabActive: palette.indigo600,
    tabInactive: palette.gray400,
    skeleton: palette.gray200,
  },
};

export const darkTheme: Theme = {
  key: 'dark',
  name: 'Dark',
  dark: true,
  iconPack: 'material',
  spacing,
  radius,
  typography: buildTypography(),
  components: components(),
  colors: {
    primary: palette.indigo400,
    primaryVariant: palette.indigo500,
    onPrimary: palette.gray950,
    secondary: palette.amber400,
    onSecondary: palette.gray950,
    background: palette.gray950,
    surface: palette.gray900,
    surfaceVariant: palette.gray800,
    card: palette.gray900,
    text: palette.gray50,
    textSecondary: palette.gray300,
    textMuted: palette.gray500,
    border: palette.gray800,
    divider: palette.gray800,
    notification: palette.red500,
    error: '#F87171',
    success: palette.emerald400,
    warning: palette.amber400,
    info: '#60A5FA',
    disabled: palette.gray700,
    placeholder: palette.gray500,
    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: palette.black,
    inputBackground: palette.gray800,
    headerBackground: palette.gray900,
    tabActive: palette.indigo400,
    tabInactive: palette.gray500,
    skeleton: palette.gray800,
  },
};

/** Custom school theme — Emerald brand (light). */
export const emeraldTheme: Theme = {
  ...lightTheme,
  key: 'school-emerald',
  name: 'Emerald School',
  components: components(1.2),
  colors: {
    ...lightTheme.colors,
    primary: palette.emerald600,
    primaryVariant: '#047857',
    secondary: palette.indigo600,
    tabActive: palette.emerald600,
  },
};

/** Custom school theme — Amber brand (light). */
export const amberTheme: Theme = {
  ...lightTheme,
  key: 'school-amber',
  name: 'Amber School',
  components: components(0.8),
  colors: {
    ...lightTheme.colors,
    primary: palette.amber600,
    primaryVariant: '#B45309',
    onPrimary: palette.white,
    secondary: palette.indigo600,
    tabActive: palette.amber600,
  },
};

export const THEMES: Record<string, Theme> = {
  [lightTheme.key]: lightTheme,
  [darkTheme.key]: darkTheme,
  [emeraldTheme.key]: emeraldTheme,
  [amberTheme.key]: amberTheme,
};

export const DEFAULT_THEME_KEY = lightTheme.key;
