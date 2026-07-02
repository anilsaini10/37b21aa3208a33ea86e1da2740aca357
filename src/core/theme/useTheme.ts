/**
 * useTheme — access the active theme + controls anywhere in the tree.
 *
 * `useThemedStyles` memoises a StyleSheet factory against the current theme so
 * screens can define styles that automatically re-derive on theme change.
 */
import {useContext, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {ThemeContext, type ThemeContextValue} from './ThemeContext';
import type {Theme} from './types';

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

type NamedStyles<T> = {[P in keyof T]: import('react-native').ViewStyle | import('react-native').TextStyle | import('react-native').ImageStyle};

export function useThemedStyles<T extends NamedStyles<T>>(
  factory: (theme: Theme) => T,
): T {
  const {theme} = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme, factory]);
}
