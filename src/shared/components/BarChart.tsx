/** Lightweight bar chart built from plain Views (no chart library needed). */
import React from 'react';
import {View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
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

  const styles = useThemedStyles(t => ({
    chartRow: {flexDirection: 'row', alignItems: 'flex-end', columnGap: t.spacing.sm},
    barColumn: {flex: 1, alignItems: 'center', rowGap: 4},
    bar: {width: '70%', borderTopLeftRadius: t.radius.sm, borderTopRightRadius: t.radius.sm},
    labelsRow: {flexDirection: 'row', marginTop: t.spacing.xs, columnGap: t.spacing.sm},
    labelText: {flex: 1},
  }));

  return (
    <View>
      <View style={[styles.chartRow, {height}]}>
        {series.values.map((v, i) => (
          <View key={i} style={styles.barColumn}>
            <AppText variant="label" color="textMuted">
              {valueFormatter ? valueFormatter(v) : v}
            </AppText>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(4, (v / max) * (height - 28)),
                  backgroundColor: barColor,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.labelsRow}>
        {series.labels.map((label, i) => (
          <AppText key={i} variant="label" color="textMuted" center style={styles.labelText}>
            {label}
          </AppText>
        ))}
      </View>
    </View>
  );
}
