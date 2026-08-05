/** Screen header with optional back button + right-side actions. */
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {AppText} from './AppText';
import {Icon} from './Icon';

export interface HeaderAction {
  icon: string;
  onPress: () => void;
  badgeCount?: number;
  /** Renders this action inside a filled circular button (theme primary color) instead of a plain icon — e.g. a prominent "add" action. */
  circle?: boolean;
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
  const styles = useThemedStyles(t => ({
    header: {
      minHeight: t.components.header.height,
      backgroundColor: t.colors.headerBackground,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: t.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.divider,
      columnGap: t.spacing.sm,
    },
    backButton: {paddingRight: t.spacing.xs},
    titleBlock: {flex: 1},
    actionButton: {padding: t.spacing.xs},
    actionButtonCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      padding: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.primary,
    },
    actionBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 16,
      height: 16,
      paddingHorizontal: 3,
      borderRadius: 8,
      backgroundColor: t.colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionBadgeText: {color: '#fff', fontSize: 9, fontWeight: '700'},
  }));
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={10} style={styles.backButton}>
          <Icon name="back" size={26} color={theme.colors.text} />
        </Pressable>
      ) : null}

      <View style={styles.titleBlock}>
        <AppText variant="headerTitle" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {actions.map((action, i) => (
        <Pressable
          key={i}
          onPress={action.onPress}
          hitSlop={10}
          style={[styles.actionButton, action.circle && styles.actionButtonCircle]}>
          <Icon
            name={action.icon}
            size={action.circle ? 18 : 22}
            color={action.circle ? theme.colors.onPrimary : theme.colors.text}
          />
          {action.badgeCount && action.badgeCount > 0 ? (
            <View style={styles.actionBadge}>
              <AppText style={styles.actionBadgeText}>
                {action.badgeCount > 9 ? '9+' : action.badgeCount}
              </AppText>
            </View>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}
