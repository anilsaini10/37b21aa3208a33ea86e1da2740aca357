/** Generic, typed data table with a header row and per-cell renderers. */
import React from 'react';
import {ScrollView, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {AppText} from './AppText';

export interface TableColumn<T> {
  key: string;
  title: string;
  width?: number;
  flex?: number;
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => string | number;
  align?: 'left' | 'center' | 'right';
}

export interface CustomTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  onRowPress?: (row: T) => void;
}

export function CustomTable<T>({
  columns,
  data,
  keyExtractor,
  onRowPress,
}: CustomTableProps<T>): React.JSX.Element {
  const {theme} = useTheme();

  const styles = useThemedStyles(t => ({
    tableWrapper: {minWidth: '100%'},
    headerRow: {
      flexDirection: 'row',
      paddingVertical: t.spacing.sm,
      backgroundColor: t.colors.surfaceVariant,
      borderTopLeftRadius: t.radius.md,
      borderTopRightRadius: t.radius.md,
    },
    dataRow: {
      flexDirection: 'row',
      paddingVertical: t.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.divider,
      backgroundColor: t.colors.card,
    },
  }));

  const cellStyle = (col: TableColumn<T>) => ({
    width: col.width,
    flex: col.width ? undefined : col.flex ?? 1,
    paddingHorizontal: theme.spacing.sm,
    justifyContent: 'center' as const,
    alignItems:
      col.align === 'right' ? ('flex-end' as const) : col.align === 'center' ? ('center' as const) : ('flex-start' as const),
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.tableWrapper}>
        {/* Header */}
        <View style={styles.headerRow}>
          {columns.map(col => (
            <View key={col.key} style={cellStyle(col)}>
              <AppText variant="label" color="textSecondary">
                {col.title}
              </AppText>
            </View>
          ))}
        </View>

        {/* Rows */}
        {data.map((row, index) => (
          <View
            key={keyExtractor(row, index)}
            onTouchEnd={onRowPress ? () => onRowPress(row) : undefined}
            style={styles.dataRow}>
            {columns.map(col => (
              <View key={col.key} style={cellStyle(col)}>
                {col.render ? (
                  col.render(row)
                ) : (
                  <AppText variant="caption" numberOfLines={1}>
                    {col.accessor ? String(col.accessor(row)) : ''}
                  </AppText>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
