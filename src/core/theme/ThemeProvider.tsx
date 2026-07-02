/**
 * ThemeProvider — wires ThemeService state into React and reacts to OS colour
 * scheme changes. Wrap the whole app in this once.
 */
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useColorScheme} from 'react-native';
import {ThemeContext, type ThemeContextValue} from './ThemeContext';
import {ThemeService} from './ThemeService';
import type {ThemeMode} from './types';

interface Props {
  children: React.ReactNode;
  /** Optional override for tests / storybook. */
  initialKey?: string;
  initialMode?: ThemeMode;
}

export function ThemeProvider({children, initialKey, initialMode}: Props): React.JSX.Element {
  const prefs = useMemo(() => ThemeService.loadPreferences(), []);
  const systemScheme = useColorScheme();

  const [themeKey, setThemeKeyState] = useState(initialKey ?? prefs.key);
  const [mode, setModeState] = useState<ThemeMode>(initialMode ?? prefs.mode);
  const [fontScale, setFontScaleState] = useState(prefs.fontScale);

  const setThemeKey = useCallback((key: string) => {
    setThemeKeyState(key);
    ThemeService.savePreferences({key});
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    ThemeService.savePreferences({mode: next});
  }, []);

  const toggleMode = useCallback(() => {
    setModeState(prev => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      ThemeService.savePreferences({mode: next});
      return next;
    });
  }, []);

  const setFontScale = useCallback((scale: number) => {
    const clamped = Math.min(Math.max(scale, 0.75), 1.6);
    setFontScaleState(clamped);
    ThemeService.savePreferences({fontScale: clamped});
  }, []);

  useEffect(() => {
    // Keep persisted key/mode in sync if provided initial overrides changed.
  }, []);

  const theme = useMemo(() => {
    // ColorSchemeName may be 'light' | 'dark' | null | undefined — narrow it.
    const scheme = systemScheme === 'dark' ? 'dark' : systemScheme === 'light' ? 'light' : null;
    const base = ThemeService.resolve(themeKey, mode, scheme);
    return ThemeService.withFontScale(base, fontScale);
  }, [themeKey, mode, systemScheme, fontScale]);

  const value = useMemo<ThemeContextValue>(
    () => ({theme, mode, fontScale, setThemeKey, setMode, toggleMode, setFontScale}),
    [theme, mode, fontScale, setThemeKey, setMode, toggleMode, setFontScale],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
