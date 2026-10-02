/**
 * DatePicker — dependency-free date field.
 *
 * A tappable field that opens a bottom sheet with day / month / year columns.
 * Value + onChange use ISO date strings ("YYYY-MM-DD").
 */
import React, {useMemo, useState} from 'react';
import {Pressable, View, type StyleProp, type TextStyle, type ViewStyle} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {useLanguage} from '../../core/i18n';
import {AppText} from './AppText';
import {Icon} from './Icon';
import {CustomBottomSheet} from './CustomBottomSheet';
import {CustomButton} from './CustomButton';
import {ScrollPicker} from './ScrollPicker';
import {formatDate} from '../../core/utils/format';
import type {TranslationKey} from '../../core/i18n';

const MONTH_KEYS: TranslationKey[] = [
  'common_monthJan', 'common_monthFeb', 'common_monthMar', 'common_monthApr',
  'common_monthMay', 'common_monthJun', 'common_monthJul', 'common_monthAug',
  'common_monthSep', 'common_monthOct', 'common_monthNov', 'common_monthDec',
];

export interface DatePickerProps {
  label?: string;
  value?: string;
  onChange: (iso: string) => void;
  minYear?: number;
  maxYear?: number;
  /** Overrides the displayed value/placeholder text's style — e.g. a smaller fontSize for a denser filter row. */
  valueStyle?: StyleProp<TextStyle>;
  /** Overrides the field box's container style (height, padding, border, background, etc.) — merged on top of the default box styling, so omitting it keeps today's exact look. */
  style?: StyleProp<ViewStyle>;
}

function toParts(iso?: string): {y: number; m: number; d: number} {
  const date = iso ? new Date(iso) : new Date();
  const valid = !isNaN(date.getTime());
  const base = valid ? date : new Date();
  return {y: base.getFullYear(), m: base.getMonth(), d: base.getDate()};
}

export function DatePicker({
  label,
  value,
  onChange,
  minYear = 2026,
  maxYear = 2045,
  valueStyle,
  style,
}: DatePickerProps): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const [open, setOpen] = useState(false);
  const [parts, setParts] = useState(() => toParts(value));
  const styles = useThemedStyles(t2 => ({
    wrapper: {
      marginBottom: t2.spacing.md,
    },
    label: {
      marginBottom: t2.spacing.xs,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: t2.components.input.height,
      borderWidth: 1,
      borderColor: t2.colors.border,
      borderRadius: t2.components.input.radius,
      paddingHorizontal: t2.spacing.md,
      backgroundColor: t2.colors.inputBackground,
    },
    pickerRow: {
      flexDirection: 'row',
      columnGap: t2.spacing.sm,
    },
  }));

  const daysInMonth = useMemo(() => new Date(parts.y, parts.m + 1, 0).getDate(), [parts.y, parts.m]);

  const dayOptions = useMemo(
    () => Array.from({length: daysInMonth}, (_, i) => ({label: String(i + 1), value: i + 1})),
    [daysInMonth],
  );
  const monthOptions = MONTH_KEYS.map((key, index) => ({label: t(key), value: index}));
  const yearOptions = useMemo(
    () => Array.from({length: maxYear - minYear + 1}, (_, i) => ({label: String(minYear + i), value: minYear + i})),
    [minYear, maxYear],
  );

  const confirm = () => {
    const d = Math.min(parts.d, daysInMonth);
    const iso = `${parts.y}-${String(parts.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onChange(iso);
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText variant="label" color="textSecondary" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <Pressable onPress={() => setOpen(true)} style={[styles.field, style]}>
        <AppText color={value ? 'text' : 'textMuted'} style={valueStyle}>
          {value ? formatDate(value) : t('common_selectDate')}
        </AppText>
        <Icon name="calendar" size={18} color={theme.colors.textMuted} />
      </Pressable>

      <CustomBottomSheet visible={open} onClose={() => setOpen(false)} title={label ?? t('common_selectDate')}>
        <View style={styles.pickerRow}>
          <ScrollPicker options={dayOptions} value={parts.d} onChange={d => setParts(p => ({...p, d}))} />
          <ScrollPicker options={monthOptions} value={parts.m} onChange={m => setParts(p => ({...p, m}))} />
          <ScrollPicker options={yearOptions} value={parts.y} onChange={y => setParts(p => ({...p, y}))} />
        </View>
        <CustomButton title={t('common_confirm')} onPress={confirm} />
      </CustomBottomSheet>
    </View>
  );
}
