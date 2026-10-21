/**
 * One month as a 7-column grid (Sun → Sat). Each date is tinted with the colour of the
 * highest-priority entry covering it; Sundays are greyed; today gets an outline.
 * `compact` = the small version used 12-up in the year view.
 */
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {AppText} from '../../../shared/components';
import {EVENT_TYPE_COLOR} from '../../events/eventTypes';
import {daysInMonth, todayIsoDate, toIsoDate, weekdayOf} from '../calendar.utils';
import type {EventType} from '../../../shared/types';

const DAY_KEYS: TranslationKey[] = [
  'common_daySun', 'common_dayMon', 'common_dayTue', 'common_dayWed',
  'common_dayThu', 'common_dayFri', 'common_daySat',
];

export function MonthGrid({
  year,
  month,
  dayTypes,
  onDayPress,
  compact,
  title,
}: {
  year: number;
  /** 1-based */
  month: number;
  dayTypes: Map<string, EventType>;
  onDayPress?: (date: string) => void;
  compact?: boolean;
  title?: string;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const cell = compact ? 20 : 44;
  const today = todayIsoDate();

  const styles = useThemedStyles(t2 => ({
    title: {marginBottom: compact ? 4 : t2.spacing.sm},
    row: {flexDirection: 'row'},
    cellWrap: {flex: 1, alignItems: 'center', paddingVertical: compact ? 1 : 3},
    cell: {
      width: cell,
      height: cell,
      borderRadius: compact ? 4 : 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    today: {borderWidth: 1.5, borderColor: t2.colors.primary},
  }));

  const total = daysInMonth(year, month);
  const lead = weekdayOf(year, month, 1);
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({length: total}, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <View>
      {title ? (
        <AppText variant={compact ? 'label' : 'bodyBold'} style={styles.title}>
          {title}
        </AppText>
      ) : null}
      <View style={styles.row}>
        {DAY_KEYS.map((key, i) => (
          <View key={key} style={styles.cellWrap}>
            <AppText
              variant="label"
              color={i === 0 ? 'error' : 'textMuted'}
              style={compact ? {fontSize: 8 * theme.typography.scale} : undefined}>
              {compact ? t(key).slice(0, 1) : t(key)}
            </AppText>
          </View>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.row}>
          {week.map((day, di) => {
            if (!day) {
              return <View key={di} style={styles.cellWrap} />;
            }
            const date = toIsoDate(year, month, day);
            const type = dayTypes.get(date);
            const isSunday = di === 0;
            const bg = type ? EVENT_TYPE_COLOR[type] : isSunday ? theme.colors.surfaceVariant : 'transparent';
            const fg = type ? '#FFFFFF' : isSunday ? theme.colors.textMuted : theme.colors.text;
            return (
              <View key={di} style={styles.cellWrap}>
                <Pressable
                  disabled={!onDayPress}
                  onPress={() => onDayPress?.(date)}
                  hitSlop={compact ? 2 : 0}
                  style={[styles.cell, {backgroundColor: bg}, date === today ? styles.today : null]}>
                  <AppText
                    variant={compact ? 'label' : 'caption'}
                    style={{color: fg, fontSize: compact ? 9 * theme.typography.scale : undefined}}>
                    {day}
                  </AppText>
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
