/** Screen header with optional back button + right-side actions. */
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTheme} from '../../core/theme';
import {AppText} from './AppText';
import {Icon} from './Icon';

export interface HeaderAction {
  icon: string;
  onPress: () => void;
  badgeCount?: number;
}

export interface CustomHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: HeaderAction[];
}

export function CustomHeader({
  title,
  subtitle,
  onBack,
  actions = [],
}: CustomHeaderProps): React.JSX.Element {
  const {theme} = useTheme();
  return (
    <View
      style={{
        minHeight: theme.components.header.height,
        backgroundColor: theme.colors.headerBackground,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
        columnGap: theme.spacing.sm,
      }}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={10} style={{paddingRight: theme.spacing.xs}}>
          <Icon name="back" size={26} color={theme.colors.text} />
        </Pressable>
      ) : null}

      <View style={{flex: 1}}>
        <AppText variant="h3" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {actions.map((action, i) => (
        <Pressable key={i} onPress={action.onPress} hitSlop={10} style={{padding: theme.spacing.xs}}>
          <Icon name={action.icon} size={22} color={theme.colors.text} />
          {action.badgeCount && action.badgeCount > 0 ? (
            <View
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                minWidth: 16,
                height: 16,
                paddingHorizontal: 3,
                borderRadius: 8,
                backgroundColor: theme.colors.error,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AppText style={{color: '#fff', fontSize: 9, fontWeight: '700'}}>
                {action.badgeCount > 9 ? '9+' : action.badgeCount}
              </AppText>
            </View>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}
