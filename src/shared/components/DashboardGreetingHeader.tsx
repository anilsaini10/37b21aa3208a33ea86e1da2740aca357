/**
 * Floating dashboard greeting header — time-of-day greeting + school subtitle,
 * with top-right action icons. Borderless/transparent (unlike `CustomHeader`'s
 * app-bar), shared across Admin/Teacher/Parent dashboards for a consistent look.
 */
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {useLanguage} from '../../core/i18n';
import {AppText} from './AppText';
import {Icon} from './Icon';
import {Row} from './layout';
import type {HeaderAction} from './CustomHeader';

export interface DashboardGreetingHeaderProps {
  name: string;
  schoolName?: string;
  actions?: HeaderAction[];
}

function greetingKeyForHour(hour: number): 'adminDashboard_goodMorning' | 'adminDashboard_goodAfternoon' | 'adminDashboard_goodEvening' {
  if (hour < 12) {
    return 'adminDashboard_goodMorning';
  }
  if (hour < 17) {
    return 'adminDashboard_goodAfternoon';
  }
  return 'adminDashboard_goodEvening';
}

export function DashboardGreetingHeader({name, schoolName, actions = []}: DashboardGreetingHeaderProps): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    wrap: {
      paddingHorizontal: t2.spacing.lg,
      paddingTop: t2.spacing.sm,
      paddingBottom: t2.spacing.md,
    },
    actionsRow: {
      marginBottom: t2.spacing.md,
    },
    actionButton: {padding: t2.spacing.xs},
    actionBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 16,
      height: 16,
      paddingHorizontal: 3,
      borderRadius: 8,
      backgroundColor: t2.colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionBadgeText: {color: '#fff', fontSize: 9, fontWeight: '700'},
  }));

  return (
    <View style={styles.wrap}>
      {actions.length > 0 ? (
        <Row justify="flex-end" gap={theme.spacing.lg} style={styles.actionsRow}>
          {actions.map((action, i) => (
            <Pressable key={i} onPress={action.onPress} hitSlop={10} style={styles.actionButton}>
              <Icon name={action.icon} size={22} color={theme.colors.text} />
              {action.badgeCount && action.badgeCount > 0 ? (
                <View style={styles.actionBadge}>
                  <AppText style={styles.actionBadgeText}>
                    {action.badgeCount > 9 ? '9+' : action.badgeCount}
                  </AppText>
                </View>
              ) : null}
            </Pressable>
          ))}
        </Row>
      ) : null}
      <AppText variant="h2">{t(greetingKeyForHour(new Date().getHours()), {name})}</AppText>
      {schoolName ? (
        <AppText variant="caption" color="textSecondary">
          {t('adminDashboard_subtitle', {schoolName})}
        </AppText>
      ) : null}
    </View>
  );
}
