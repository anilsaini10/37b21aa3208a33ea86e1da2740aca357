/** Two-column grid of dashboard KPI tiles — chunks `stats` into equal-width rows. */
import React from 'react';
import {View} from 'react-native';
import {useThemedStyles} from '../../core/theme';
import {StatTile} from './StatTile';
import type {StatCard} from '../types';

export function StatGrid({stats}: {stats: StatCard[]}): React.JSX.Element {
  const styles = useThemedStyles(theme => ({
    row: {
      flexDirection: 'row',
      columnGap: theme.spacing.md,
    },
    rowSpacing: {
      marginTop: theme.spacing.md,
    },
    tileWrapper: {
      flex: 1,
    },
  }));
  const rows: StatCard[][] = [];
  for (let i = 0; i < stats.length; i += 2) {
    rows.push(stats.slice(i, i + 2));
  }

  return (
    <View>
      {rows.map((row, i) => (
        <View
          key={row.map(s => s.key).join('-')}
          style={[styles.row, i !== 0 && styles.rowSpacing]}>
          {row.map(s => (
            <View key={s.key} style={styles.tileWrapper}>
              <StatTile stat={s} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
