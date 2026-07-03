/** Dashboard KPI tile. */
import React from 'react';
import {View} from 'react-native';
import {useTheme} from '../../core/theme';
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

  return (
    <CustomCard onPress={onPress} style={{minWidth: 150}}>
      <Row justify="space-between" align="flex-start">
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.radius.md,
            backgroundColor: accent + '22',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name={stat.icon} size={20} color={accent} />
        </View>
        {stat.delta !== undefined ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              columnGap: 2,
              paddingHorizontal: theme.spacing.xs,
              paddingVertical: 2,
              borderRadius: theme.radius.pill,
              backgroundColor: (stat.delta >= 0 ? theme.colors.success : theme.colors.error) + '1A',
            }}>
            <Icon
              name="performance"
              size={10}
              color={stat.delta >= 0 ? theme.colors.success : theme.colors.error}
              style={stat.delta < 0 ? {transform: [{rotate: '180deg'}]} : undefined}
            />
            <AppText
              variant="label"
              style={{color: stat.delta >= 0 ? theme.colors.success : theme.colors.error}}>
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
