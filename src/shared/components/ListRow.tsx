/** Reusable list item row: leading avatar/icon, title/subtitle, trailing slot. */
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {AppText} from './AppText';
import {Icon} from './Icon';
import {Avatar} from './Avatar';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  avatarName?: string;
  avatarUri?: string;
  icon?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}

export function ListRow({
  title,
  subtitle,
  avatarName,
  avatarUri,
  icon,
  right,
  onPress,
}: ListRowProps): React.JSX.Element {
  const {theme} = useTheme();
  const styles = useThemedStyles(t => ({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: t.spacing.md,
      paddingVertical: t.spacing.md,
    },
    iconCircle: {
      width: 42,
      height: 42,
      borderRadius: t.radius.md,
      backgroundColor: t.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textBlock: {
      flex: 1,
    },
  }));

  const content = (
    <View style={styles.row}>
      {avatarName !== undefined ? (
        <Avatar name={avatarName} uri={avatarUri} size={42} />
      ) : icon ? (
        <View style={styles.iconCircle}>
          <Icon name={icon} size={20} />
        </View>
      ) : null}
      <View style={styles.textBlock}>
        <AppText variant="bodyBold" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ?? (onPress ? <Icon name="forward" size={20} color={theme.colors.textMuted} /> : null)}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({pressed}) => ({opacity: pressed ? 0.7 : 1})}>
        {content}
      </Pressable>
    );
  }
  return content;
}
