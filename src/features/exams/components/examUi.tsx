/** Small presentational bits shared by the admin, teacher and parent exam screens. */
import React from 'react';
import {Pressable} from 'react-native';
import {useThemedStyles} from '../../../core/theme';
import type {TranslationKey} from '../../../core/i18n';
import {AppText} from '../../../shared/components';
import {formatPaperDate, paperWeekday} from '../examSchedule.utils';

const DAY_KEYS: TranslationKey[] = [
  'common_daySun', 'common_dayMon', 'common_dayTue', 'common_dayWed',
  'common_dayThu', 'common_dayFri', 'common_daySat',
];

/** "Mon, 20 Oct 2026" — weekday from the date parts, so no timezone shift. */
export function dayLabel(date: string, t: (key: TranslationKey) => string, withYear = true): string {
  return `${t(DAY_KEYS[paperWeekday(date)])}, ${formatPaperDate(date, withYear)}`;
}

export function Chip({label, active, onPress}: {label: string; active: boolean; onPress: () => void}): React.JSX.Element {
  const styles = useThemedStyles(t2 => ({
    chip: {
      paddingHorizontal: t2.spacing.md,
      paddingVertical: t2.spacing.xs + 2,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: active ? t2.colors.primary : t2.colors.border,
      backgroundColor: active ? t2.colors.primary : t2.colors.surface,
    },
  }));
  return (
    <Pressable onPress={onPress} style={styles.chip}>
      <AppText variant="label" color={active ? 'onPrimary' : 'textSecondary'}>
        {label}
      </AppText>
    </Pressable>
  );
}
