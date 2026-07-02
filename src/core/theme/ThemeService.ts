/**
 * ThemeService — pure logic for resolving, persisting and scaling themes.
 *
 * Separated from React so it is unit-testable. The ThemeProvider delegates all
 * decisions (which theme key, dark/light resolution, font scaling) to this
 * service.
 */
import {storage, StorageKeys} from '../storage/storage';
import {THEMES, DEFAULT_THEME_KEY, lightTheme, darkTheme} from './themes';
import {buildTypography} from './typography';
import type {Theme, ThemeMode} from './types';

export const ThemeService = {
  /** All selectable themes (for a theme-picker UI). */
  available(): Theme[] {
    return Object.values(THEMES);
  },

  getByKey(key: string): Theme | undefined {
    return THEMES[key];
  },

  /**
   * Resolve the effective theme given a stored key, a light/dark mode and the
   * OS colour scheme. When mode is 'system', the OS scheme wins over the stored
   * theme's own `dark` flag.
   */
  resolve(key: string, mode: ThemeMode, systemScheme: 'light' | 'dark' | null): Theme {
    if (mode === 'system') {
      return systemScheme === 'dark' ? darkTheme : lightTheme;
    }
    const base = THEMES[key] ?? THEMES[DEFAULT_THEME_KEY];
    if (mode === 'dark' && !base.dark) {
      return darkTheme;
    }
    if (mode === 'light' && base.dark) {
      return lightTheme;
    }
    return base;
  },

  /** Apply an accessibility font scale to a theme, returning a new object. */
  withFontScale(theme: Theme, scale: number): Theme {
    if (scale === 1) {
      return theme;
    }
    return {
      ...theme,
      typography: buildTypography(theme.typography.fontFamily, scale),
    };
  },

  loadPreferences(): {key: string; mode: ThemeMode; fontScale: number} {
    return {
      key: storage.getString(StorageKeys.THEME_KEY) ?? DEFAULT_THEME_KEY,
      mode: (storage.getString(StorageKeys.THEME_MODE) as ThemeMode) ?? 'system',
      fontScale: storage.getNumber(StorageKeys.FONT_SCALE) ?? 1,
    };
  },

  savePreferences(prefs: {key?: string; mode?: ThemeMode; fontScale?: number}): void {
    if (prefs.key !== undefined) {
      storage.set(StorageKeys.THEME_KEY, prefs.key);
    }
    if (prefs.mode !== undefined) {
      storage.set(StorageKeys.THEME_MODE, prefs.mode);
    }
    if (prefs.fontScale !== undefined) {
      storage.set(StorageKeys.FONT_SCALE, prefs.fontScale);
    }
  },
};
