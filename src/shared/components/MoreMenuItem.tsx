/**
 * Menu-list row shared by every role's More/Profile screen (Admin More,
 * Admin/Teacher/Parent Profile) — colored left accent bar, pastel icon box
 * (derived from the accent color via alpha blend, so it adapts to light/dark
 * theme automatically), dark title, code-drawn chevron. Purely visual — press
 * and navigation behavior stay fully owned by the caller.
 */
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {AppText} from './AppText';
import {Icon} from './Icon';
import {ChevronRight} from './ChevronRight';

/** Soft accent palette for a menu row's left bar + icon tint. */
const MORE_MENU_TONE_ACCENTS = {
  purple: '#7C5CFC',
  green: '#4CCB7F',
  blue: '#4D8DFF',
  orange: '#FF9F43',
  teal: '#35C9A5',
} as const;

type MoreMenuTone = keyof typeof MORE_MENU_TONE_ACCENTS;

const MORE_MENU_TONE_CYCLE: MoreMenuTone[] = ['purple', 'green', 'blue', 'orange', 'teal'];

/** Deterministic accent for the Nth row in a menu list, so consecutive rows read as visually distinct. */
export function moreMenuAccentForIndex(index: number): string {
  return MORE_MENU_TONE_ACCENTS[MORE_MENU_TONE_CYCLE[index % MORE_MENU_TONE_CYCLE.length]];
}

export interface MoreMenuItemProps {
  title: string;
  icon: string;
  accentColor: string;
  onPress: () => void;
}

export function MoreMenuItem({title, icon, accentColor, onPress}: MoreMenuItemProps): React.JSX.Element {
  const {theme} = useTheme();
  const titleColor = theme.dark ? theme.colors.text : '#111827';
  const chevronColor = theme.dark ? theme.colors.textMuted : '#9AA6B5';
  const styles = useThemedStyles(t => ({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 66,
      paddingHorizontal: t.spacing.md,
      borderRadius: 15,
      marginVertical: 2,
      columnGap: t.spacing.md,
    },
    rowPressed: {
      backgroundColor: t.colors.primary + '0D',
    },
    accentBar: {
      width: 3,
      height: 40,
      borderRadius: 3,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {flex: 1},
  }));

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button">
      <View style={[styles.accentBar, {backgroundColor: accentColor}]} />
      <View style={[styles.iconBox, {backgroundColor: accentColor + '1F'}]}>
        <Icon name={icon} size={22} color={accentColor} />
      </View>
      <AppText numberOfLines={1} style={[styles.title, {color: titleColor, fontSize: 16, fontWeight: '600'}]}>
        {title}
      </AppText>
      <ChevronRight size={11} color={chevronColor} />
    </Pressable>
  );
}

export interface MoreMenuTileProps {
  title: string;
  icon: string;
  accentColor: string;
  onPress: () => void;
}

/** Grid-tile variant of the same menu row — icon in a pastel circle, short centered label below. Used by grid-style More screens. */
export function MoreMenuTile({title, icon, accentColor, onPress}: MoreMenuTileProps): React.JSX.Element {
  const {theme} = useTheme();
  const titleColor = theme.dark ? theme.colors.text : '#111827';
  const styles = useThemedStyles(t => ({
    tile: {
      backgroundColor: theme.dark ? t.colors.card : '#FFFFFF',
      borderRadius: 18,
      paddingVertical: t.spacing.md,
      paddingHorizontal: t.spacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: t.colors.shadow,
      shadowOpacity: theme.dark ? 0.25 : 0.05,
      shadowRadius: 8,
      shadowOffset: {width: 0, height: 2},
      elevation: 2,
    },
    tilePressed: {
      opacity: 0.85,
    },
    iconCircle: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.spacing.sm,
    },
  }));

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.tile, pressed && styles.tilePressed]}
      accessibilityRole="button">
      <View style={[styles.iconCircle, {backgroundColor: accentColor + '1F'}]}>
        <Icon name={icon} size={22} color={accentColor} />
      </View>
      <AppText numberOfLines={2} center style={{color: titleColor, fontSize: 12.5, fontWeight: '600'}}>
        {title}
      </AppText>
    </Pressable>
  );
}
