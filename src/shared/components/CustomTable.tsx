/** Generic, typed data table with a header row and per-cell renderers. */
import React from 'react';
import {ScrollView, View} from 'react-native';
import {useTheme} from '../../core/theme';
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
      <View style={{minWidth: '100%'}}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: theme.spacing.sm,
            backgroundColor: theme.colors.surfaceVariant,
            borderTopLeftRadius: theme.radius.md,
            borderTopRightRadius: theme.radius.md,
          }}>
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
            style={{
              flexDirection: 'row',
              paddingVertical: theme.spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.divider,
              backgroundColor: theme.colors.card,
            }}>
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
