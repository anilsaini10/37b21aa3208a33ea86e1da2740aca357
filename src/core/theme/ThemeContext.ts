/**
 * ThemeContext — the runtime theme + controls exposed to the component tree.
 */
import {createContext} from 'react';
import type {Theme, ThemeMode} from './types';
import {lightTheme} from './themes';

export interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  fontScale: number;
  /** Select a specific theme by key (e.g. a custom school brand). */
  setThemeKey: (key: string) => void;
  /** Choose light / dark / follow-system. */
  setMode: (mode: ThemeMode) => void;
  /** Toggle between light and dark quickly. */
  toggleMode: () => void;
  /** Set the accessibility font scale (clamped 0.75–1.6). */
  setFontScale: (scale: number) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  mode: 'system',
  fontScale: 1,
  setThemeKey: () => undefined,
  setMode: () => undefined,
  toggleMode: () => undefined,
  setFontScale: () => undefined,
});
