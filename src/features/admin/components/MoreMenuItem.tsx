/**
 * More-screen menu row — colored left accent bar, pastel icon box (derived
 * from the accent color via alpha blend, so it adapts to light/dark theme
 * automatically), dark title, code-drawn chevron. Purely visual — press and
 * navigation behavior stay fully owned by the caller.
 */
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {AppText, Icon, ChevronRight} from '../../../shared/components';

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
