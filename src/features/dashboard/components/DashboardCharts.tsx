/**
 * Small chart building blocks for the admin dashboard (react-native-svg + Views, no chart lib):
 *   DonutChart       — share of a whole (attendance status), with a legend of counts + %
 *   ProgressBarList  — a few magnitudes side by side (school at a glance)
 *   StackedBarChart  — per-category stacked counts (attendance by class); tap a bar for its numbers
 * Text always uses text colours; colour only marks identity, and every colour has a legend label.
 */
import React, {useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import Svg, {Circle, G} from 'react-native-svg';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {AppText, Row} from '../../../shared/components';

export interface ChartSlice {
  key: string;
  label: string;
  value: number;
  color: string;
}

function percent(value: number, total: number): string {
  return total > 0 ? `${Math.round((value / total) * 100)}%` : '—';
}

/** Donut + legend. `centerValue` / `centerLabel` go in the hole; an all-zero chart shows `emptyLabel`. */
export function DonutChart({
  slices,
  centerValue,
  centerLabel,
  emptyLabel,
  size = 132,
  thickness = 18,
}: {
  slices: ChartSlice[];
  centerValue?: string | number;
  centerLabel?: string;
  emptyLabel: string;
  size?: number;
  thickness?: number;
}): React.JSX.Element {
  const {theme} = useTheme();
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  // A 2px surface gap between segments (only when there's more than one non-zero segment).
  const nonZero = slices.filter(s => s.value > 0).length;
  const gap = nonZero > 1 ? 2 : 0;

  const styles = useThemedStyles(t => ({
    wrap: {flexDirection: 'row', alignItems: 'center', columnGap: t.spacing.lg},
    donut: {width: size, height: size, alignItems: 'center', justifyContent: 'center'},
    center: {position: 'absolute', alignItems: 'center', paddingHorizontal: thickness},
    legend: {flex: 1, rowGap: t.spacing.sm},
    dot: {width: 10, height: 10, borderRadius: 5},
    count: {width: 32, textAlign: 'right'},
    pct: {width: 40, textAlign: 'right'},
  }));

  let offset = 0;
  return (
    <View style={styles.wrap}>
      <View style={styles.donut}>
        <Svg width={size} height={size}>
          {/* Track */}
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.colors.surfaceVariant} strokeWidth={thickness} fill="none" />
          {total > 0 ? (
            <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
              {slices.map(s => {
                if (s.value <= 0) {
                  return null;
                }
                const length = (s.value / total) * circumference;
                const dash = Math.max(0, length - gap);
                const el = (
                  <Circle
                    key={s.key}
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    stroke={s.color}
                    strokeWidth={thickness}
                    fill="none"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                  />
                );
                offset += length;
                return el;
              })}
            </G>
          ) : null}
        </Svg>
        <View style={styles.center} pointerEvents="none">
          {total > 0 && centerValue !== undefined ? (
            <>
              <AppText variant="h2">{centerValue}</AppText>
              {centerLabel ? (
                <AppText variant="label" color="textMuted">
                  {centerLabel}
                </AppText>
              ) : null}
            </>
          ) : (
            <AppText variant="label" color="textMuted" center>
              {emptyLabel}
            </AppText>
          )}
        </View>
      </View>
      <View style={styles.legend}>
        {slices.map(s => (
          <Row key={s.key} gap={8}>
            <View style={[styles.dot, {backgroundColor: s.color}]} />
            <AppText variant="caption" style={{flex: 1}} numberOfLines={1}>
              {s.label}
            </AppText>
            <AppText variant="bodyBold" style={styles.count}>
              {s.value}
            </AppText>
            <AppText variant="label" color="textMuted" style={styles.pct}>
              {percent(s.value, total)}
            </AppText>
          </Row>
        ))}
      </View>
    </View>
  );
}

/** Labelled horizontal bars, each scaled against the largest value. */
export function ProgressBarList({items}: {items: ChartSlice[]}): React.JSX.Element {
  const max = Math.max(1, ...items.map(i => i.value));
  const styles = useThemedStyles(t => ({
    item: {marginBottom: t.spacing.md},
    track: {height: 10, borderRadius: 5, backgroundColor: t.colors.surfaceVariant, overflow: 'hidden', marginTop: 6},
    fill: {height: '100%', borderRadius: 5},
  }));
  return (
    <View>
      {items.map(i => (
        <View key={i.key} style={styles.item}>
          <Row justify="space-between">
            <AppText variant="caption">{i.label}</AppText>
            <AppText variant="bodyBold">{i.value}</AppText>
          </Row>
          <View style={styles.track}>
            <View style={[styles.fill, {width: `${(i.value / max) * 100}%`, backgroundColor: i.color}]} />
          </View>
        </View>
      ))}
    </View>
  );
}

export interface StackedBar {
  key: string;
  label: string;
  /** Segment values in the same order as `series`. */
  values: number[];
}

/** At most this many bars share the visible width; more than that scroll horizontally. */
const MAX_VISIBLE_BARS = 5;
const AXIS_WIDTH = 28;

/**
 * Vertical stacked bars on one shared scale (0 → max total). A 2px gap separates stacked
 * segments; the top segment has rounded ends. Tap a bar to see its numbers below the chart.
 *
 * Width is dynamic: each column gets plotWidth / min(bars, MAX_VISIBLE_BARS), so up to 5 bars
 * fill the card and more than 5 scroll sideways (the 0/max axis stays fixed on the left).
 */
export function StackedBarChart({
  bars,
  series,
  height = 150,
  emptyLabel,
  scrollHint,
}: {
  bars: StackedBar[];
  series: {key: string; label: string; color: string}[];
  height?: number;
  emptyLabel: string;
  /** Shown when the bars scroll, e.g. "Swipe to see all 8 classes". */
  scrollHint?: string;
}): React.JSX.Element {
  const {theme} = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  const [plotWidth, setPlotWidth] = useState(0);
  const totals = bars.map(b => b.values.reduce((s, v) => s + v, 0));
  const max = Math.max(0, ...totals);
  const scrolls = bars.length > MAX_VISIBLE_BARS;
  const columnWidth = plotWidth > 0 ? plotWidth / Math.min(Math.max(bars.length, 1), MAX_VISIBLE_BARS) : 0;

  const styles = useThemedStyles(t => ({
    legend: {flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.md, marginBottom: t.spacing.md},
    dot: {width: 10, height: 10, borderRadius: 5},
    axis: {width: AXIS_WIDTH, height, justifyContent: 'space-between', paddingRight: 4, alignItems: 'flex-end'},
    plotArea: {flex: 1},
    columns: {flexDirection: 'row'},
    column: {alignItems: 'center'},
    barSlot: {
      height,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-end',
      borderBottomWidth: 1,
      borderBottomColor: t.colors.divider,
    },
    bar: {width: '56%', maxWidth: 36, justifyContent: 'flex-end', rowGap: 2},
    label: {marginTop: 4, paddingHorizontal: 2},
    hint: {marginTop: t.spacing.xs},
    detail: {marginTop: t.spacing.sm, padding: t.spacing.sm, borderRadius: t.radius.md, backgroundColor: t.colors.surfaceVariant},
  }));

  const legend = (
    <View style={styles.legend}>
      {series.map(s => (
        <Row key={s.key} gap={6}>
          <View style={[styles.dot, {backgroundColor: s.color}]} />
          <AppText variant="label" color="textSecondary">
            {s.label}
          </AppText>
        </Row>
      ))}
    </View>
  );

  if (bars.length === 0) {
    return (
      <>
        {legend}
        <AppText variant="caption" color="textMuted" center>
          {emptyLabel}
        </AppText>
      </>
    );
  }

  const selectedIndex = bars.findIndex(b => b.key === selected);

  // Bar + its label in one column, so they always stay aligned while scrolling.
  const columns = (
    <View style={styles.columns}>
      {bars.map((b, bi) => {
        const total = totals[bi];
        const barHeight = max > 0 ? (total / max) * height : 0;
        const active = b.key === selected;
        // Drawn bottom-up: the first series sits on the baseline.
        const segments = b.values.map((v, i) => ({v, s: series[i]})).filter(x => x.v > 0);
        return (
          <Pressable
            key={b.key}
            style={[styles.column, {width: columnWidth}]}
            onPress={() => setSelected(active ? null : b.key)}
            accessibilityLabel={`${b.label}: ${segments.map(x => `${x.s.label} ${x.v}`).join(', ') || 0}`}>
            <View style={styles.barSlot}>
              <View style={[styles.bar, {height: barHeight, opacity: selected && !active ? 0.45 : 1}]}>
                {[...segments].reverse().map((x, i) => (
                  <View
                    key={x.s.key}
                    style={{
                      height: Math.max(2, (x.v / total) * barHeight - 2),
                      backgroundColor: x.s.color,
                      borderTopLeftRadius: i === 0 ? 4 : 0,
                      borderTopRightRadius: i === 0 ? 4 : 0,
                    }}
                  />
                ))}
              </View>
            </View>
            <AppText
              variant="label"
              color={active ? 'text' : 'textMuted'}
              center
              numberOfLines={2}
              style={styles.label}>
              {b.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View>
      {legend}
      <Row align="flex-start">
        <View style={styles.axis}>
          <AppText variant="label" color="textMuted">
            {max}
          </AppText>
          <AppText variant="label" color="textMuted">
            0
          </AppText>
        </View>
        <View style={styles.plotArea} onLayout={e => setPlotWidth(e.nativeEvent.layout.width)}>
          {columnWidth === 0 ? null : scrolls ? (
            <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
              {columns}
            </ScrollView>
          ) : (
            columns
          )}
        </View>
      </Row>
      {scrolls && scrollHint ? (
        <Row gap={4} style={styles.hint}>
          <AppText variant="label" color="textMuted">
            {scrollHint}
          </AppText>
          <AppText variant="label" color="textMuted">
            →
          </AppText>
        </Row>
      ) : null}
      {selectedIndex >= 0 ? (
        <View style={styles.detail}>
          <AppText variant="bodyBold">
            {bars[selectedIndex].label} · {totals[selectedIndex]}
          </AppText>
          <Row gap={theme.spacing.md} wrap style={{rowGap: 2}}>
            {series.map((s, i) => (
              <AppText key={s.key} variant="label" color="textSecondary">
                {s.label}: {bars[selectedIndex].values[i]}
              </AppText>
            ))}
          </Row>
        </View>
      ) : null}
    </View>
  );
}
