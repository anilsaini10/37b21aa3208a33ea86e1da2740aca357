/** Dashboard KPI tile. */
import React from 'react';
import {View} from 'react-native';
import {useTheme} from '../../core/theme';
import {CustomCard} from './CustomCard';
import {AppText} from './AppText';
import {Icon} from './Icon';
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

  return (
    <CustomCard onPress={onPress} style={{flex: 1, minWidth: 150}}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radius.md,
          backgroundColor: accent + '22',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.sm,
        }}>
        <Icon name={stat.icon} size={20} color={accent} />
      </View>
      <AppText variant="h2">{stat.value}</AppText>
      <AppText variant="caption" color="textSecondary">
        {stat.label}
      </AppText>
      {stat.delta !== undefined ? (
        <AppText variant="label" style={{color: stat.delta >= 0 ? theme.colors.success : theme.colors.error, marginTop: 2}}>
          {stat.delta >= 0 ? '▲' : '▼'} {Math.abs(stat.delta)}%
        </AppText>
      ) : null}
    </CustomCard>
  );
}
