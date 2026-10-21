/** Mon–Sat weekday picker as chips (school days; Sunday is always off). */
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {AppText} from '../../../shared/components';
import type {ScheduleDay} from '../../../shared/types';

export const SCHOOL_DAYS: {day: ScheduleDay; key: TranslationKey}[] = [
  {day: 'MONDAY', key: 'common_dayMon'},
  {day: 'TUESDAY', key: 'common_dayTue'},
  {day: 'WEDNESDAY', key: 'common_dayWed'},
  {day: 'THURSDAY', key: 'common_dayThu'},
  {day: 'FRIDAY', key: 'common_dayFri'},
  {day: 'SATURDAY', key: 'common_daySat'},
];

/** Local "YYYY-MM-DD" (toISOString is UTC — early morning in IST it would still be yesterday). */
export function todayLocalIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function WeekdayChips({value, onChange}: {value: ScheduleDay; onChange: (day: ScheduleDay) => void}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    row: {flexDirection: 'row', flexWrap: 'wrap', gap: t2.spacing.sm, marginBottom: t2.spacing.md},
    chip: {paddingHorizontal: t2.spacing.md, paddingVertical: 6, borderRadius: 999, borderWidth: 1},
  }));
  return (
    <View style={styles.row}>
      {SCHOOL_DAYS.map(({day, key}) => {
        const active = value === day;
        return (
          <Pressable
            key={day}
            onPress={() => onChange(day)}
            style={[
              styles.chip,
              {
                borderColor: active ? theme.colors.primary : theme.colors.border,
                backgroundColor: active ? theme.colors.primary : theme.colors.surface,
              },
            ]}>
            <AppText variant="label" color={active ? 'onPrimary' : 'textSecondary'}>
              {t(key)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
