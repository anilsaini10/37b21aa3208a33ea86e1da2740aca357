/** Two-column grid of dashboard KPI tiles — chunks `stats` into equal-width rows. */
import React from 'react';
import {View} from 'react-native';
import {useTheme} from '../../core/theme';
import {StatTile} from './StatTile';
import type {StatCard} from '../types';

export function StatGrid({stats}: {stats: StatCard[]}): React.JSX.Element {
  const {theme} = useTheme();
  const rows: StatCard[][] = [];
  for (let i = 0; i < stats.length; i += 2) {
    rows.push(stats.slice(i, i + 2));
  }

  return (
    <View>
      {rows.map((row, i) => (
        <View
          key={row.map(s => s.key).join('-')}
          style={{
            flexDirection: 'row',
            columnGap: theme.spacing.md,
            marginTop: i === 0 ? 0 : theme.spacing.md,
          }}>
          {row.map(s => (
            <View key={s.key} style={{flex: 1}}>
              <StatTile stat={s} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
