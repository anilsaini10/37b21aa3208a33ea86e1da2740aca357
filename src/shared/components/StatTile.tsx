/** Dashboard KPI tile. */
import React from 'react';
import {View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {CustomCard} from './CustomCard';
import {AppText} from './AppText';
import {Icon} from './Icon';
import {Row, Spacer} from './layout';
import type {StatCard} from '../types';

const ACCENTS: Record<StatCard['accent'], keyof import('../../core/theme').ThemeColors> = {
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
};

export function StatTile({stat, onPress}: {stat: StatCard; onPress?: () => void}): React.JSX.Element {
  const {theme} = useTheme();
  const accent = theme.colors[ACCENTS[stat.accent]];
  const styles = useThemedStyles(t => ({
    card: {
      minWidth: 150,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: t.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deltaBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 2,
      paddingHorizontal: t.spacing.xs,
      paddingVertical: 2,
      borderRadius: t.radius.pill,
    },
    deltaBadgePositive: {
      backgroundColor: t.colors.success + '1A',
    },
    deltaBadgeNegative: {
      backgroundColor: t.colors.error + '1A',
    },
    deltaIconRotated: {
      transform: [{rotate: '180deg'}],
    },
    deltaTextPositive: {
      color: t.colors.success,
    },
    deltaTextNegative: {
      color: t.colors.error,
    },
  }));

  return (
    <CustomCard onPress={onPress} style={styles.card}>
      <Row justify="space-between" align="flex-start">
        {/* backgroundColor is derived at runtime from the stat's accent key
            (one of 5 theme colors) so it stays inline rather than a static style */}
        <View style={[styles.iconCircle, {backgroundColor: accent + '22'}]}>
          <Icon name={stat.icon} size={20} color={accent} />
        </View>
        {stat.delta !== undefined ? (
          <View style={[styles.deltaBadge, stat.delta >= 0 ? styles.deltaBadgePositive : styles.deltaBadgeNegative]}>
            <Icon
              name="performance"
              size={10}
              color={stat.delta >= 0 ? theme.colors.success : theme.colors.error}
              style={stat.delta < 0 ? styles.deltaIconRotated : undefined}
            />
            <AppText
              variant="label"
              style={stat.delta >= 0 ? styles.deltaTextPositive : styles.deltaTextNegative}>
              {Math.abs(stat.delta)}%
            </AppText>
          </View>
        ) : null}
      </Row>
      <Spacer size={theme.spacing.sm} />
      <AppText variant="h2">{stat.value}</AppText>
      <AppText variant="caption" color="textSecondary">
        {stat.label}
      </AppText>
    </CustomCard>
  );
}
