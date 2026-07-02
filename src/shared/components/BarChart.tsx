/** Lightweight bar chart built from plain Views (no chart library needed). */
import React from 'react';
import {View} from 'react-native';
import {useTheme} from '../../core/theme';
import {AppText} from './AppText';
import type {ChartSeries} from '../types';

export interface BarChartProps {
  series: ChartSeries;
  height?: number;
  color?: string;
  valueFormatter?: (v: number) => string;
}

export function BarChart({
  series,
  height = 160,
  color,
  valueFormatter,
}: BarChartProps): React.JSX.Element {
  const {theme} = useTheme();
  const max = Math.max(1, ...series.values);
  const barColor = color ?? theme.colors.primary;

  return (
    <View>
      <View style={{flexDirection: 'row', alignItems: 'flex-end', height, columnGap: theme.spacing.sm}}>
        {series.values.map((v, i) => (
          <View key={i} style={{flex: 1, alignItems: 'center', rowGap: 4}}>
            <AppText variant="label" color="textMuted">
              {valueFormatter ? valueFormatter(v) : v}
            </AppText>
            <View
              style={{
                width: '70%',
                height: Math.max(4, (v / max) * (height - 28)),
                backgroundColor: barColor,
                borderTopLeftRadius: theme.radius.sm,
                borderTopRightRadius: theme.radius.sm,
              }}
            />
          </View>
        ))}
      </View>
      <View style={{flexDirection: 'row', marginTop: theme.spacing.xs, columnGap: theme.spacing.sm}}>
        {series.labels.map((label, i) => (
          <AppText key={i} variant="label" color="textMuted" center style={{flex: 1}}>
            {label}
          </AppText>
        ))}
      </View>
    </View>
  );
}
