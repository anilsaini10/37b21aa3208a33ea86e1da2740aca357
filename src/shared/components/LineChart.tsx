/** Line/trend chart rendered with react-native-svg. */
import React from 'react';
import {View} from 'react-native';
import Svg, {Polyline, Circle, Line} from 'react-native-svg';
import {useTheme, useThemedStyles} from '../../core/theme';
import {AppText} from './AppText';
import type {ChartSeries} from '../types';

export interface LineChartProps {
  series: ChartSeries;
  width?: number;
  height?: number;
  color?: string;
}

export function LineChart({
  series,
  width = 300,
  height = 160,
  color,
}: LineChartProps): React.JSX.Element {
  const {theme} = useTheme();
  const stroke = color ?? theme.colors.primary;
  const styles = useThemedStyles(t => ({
    labelsRow: {
      flexDirection: 'row',
      columnGap: t.spacing.xs,
    },
    labelText: {
      flex: 1,
    },
  }));

  const padding = 24;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const max = Math.max(1, ...series.values);
  const min = Math.min(0, ...series.values);
  const range = max - min || 1;
  const n = series.values.length;

  const points = series.values.map((v, i) => {
    const x = padding + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
    const y = padding + chartH - ((v - min) / range) * chartH;
    return {x, y};
  });

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View>
      <Svg width={width} height={height}>
        {/* baseline */}
        <Line
          x1={padding}
          y1={padding + chartH}
          x2={padding + chartW}
          y2={padding + chartH}
          stroke={theme.colors.divider}
          strokeWidth={1}
        />
        <Polyline points={polyline} fill="none" stroke={stroke} strokeWidth={2.5} />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={stroke} />
        ))}
      </Svg>
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
