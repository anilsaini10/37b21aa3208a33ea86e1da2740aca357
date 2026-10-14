/** Generic, typed data table with a header row and per-cell renderers. */
import React, {useState} from 'react';
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
  /**
   * Visible width of the horizontal scroller. Inside a horizontal ScrollView '100%' has nothing to
   * resolve against, so each row would size to its own content and columns drift row to row —
   * an explicit minWidth makes every row (and the header) exactly the same width.
   */
  const [viewportWidth, setViewportWidth] = useState(0);

  const styles = useThemedStyles(t => ({
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

  // Flex columns get an explicit pixel width (their share of what's left after fixed columns), so the
  // header and every row use the exact same widths — letting the layout engine flex them per row made
  // columns drift with each row's content (e.g. "Tue" vs "Mon", "Present" vs "Absent").
  const fixedTotal = columns.reduce((sum, c) => sum + (c.width ?? 0), 0);
  const flexTotal = columns.reduce((sum, c) => sum + (c.width ? 0 : c.flex ?? 1), 0);
  const flexSpace = Math.max(0, viewportWidth - fixedTotal);
  const widthOf = (col: TableColumn<T>): number | undefined =>
    col.width ?? (viewportWidth > 0 && flexTotal > 0 ? (flexSpace * (col.flex ?? 1)) / flexTotal : undefined);

  const cellStyle = (col: TableColumn<T>, isLast: boolean) => ({
    width: widthOf(col),
    // Until the viewport is measured (first frame), fall back to plain flex.
    flex: widthOf(col) === undefined ? col.flex ?? 1 : undefined,
    paddingHorizontal: theme.spacing.sm,
    justifyContent: 'center' as const,
    alignItems:
      col.align === 'right' ? ('flex-end' as const) : col.align === 'center' ? ('center' as const) : ('flex-start' as const),
    borderRightWidth: isLast ? 0 : 1,
    borderRightColor: theme.colors.divider,
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={e => setViewportWidth(e.nativeEvent.layout.width)}>
      <View style={{minWidth: viewportWidth}}>
        {/* Header */}
        <View style={styles.headerRow}>
          {columns.map((col, i) => (
            <View key={col.key} style={cellStyle(col, i === columns.length - 1)}>
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
            {columns.map((col, i) => (
              <View key={col.key} style={cellStyle(col, i === columns.length - 1)}>
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
