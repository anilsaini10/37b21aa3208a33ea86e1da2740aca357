/**
 * DatePicker — dependency-free date field.
 *
 * A tappable field that opens a bottom sheet with day / month / year columns.
 * Value + onChange use ISO date strings ("YYYY-MM-DD").
 */
import React, {useMemo, useState} from 'react';
import {Pressable, View} from 'react-native';
import {useTheme} from '../../core/theme';
import {AppText} from './AppText';
import {Icon} from './Icon';
import {CustomBottomSheet} from './CustomBottomSheet';
import {CustomButton} from './CustomButton';
import {ScrollPicker} from './ScrollPicker';
import {formatDate} from '../../core/utils/format';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export interface DatePickerProps {
  label?: string;
  value?: string;
  onChange: (iso: string) => void;
  minYear?: number;
  maxYear?: number;
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
  minYear = 1990,
  maxYear = 2035,
}: DatePickerProps): React.JSX.Element {
  const {theme} = useTheme();
  const [open, setOpen] = useState(false);
  const [parts, setParts] = useState(() => toParts(value));

  const daysInMonth = useMemo(() => new Date(parts.y, parts.m + 1, 0).getDate(), [parts.y, parts.m]);

  const dayOptions = useMemo(
    () => Array.from({length: daysInMonth}, (_, i) => ({label: String(i + 1), value: i + 1})),
    [daysInMonth],
  );
  const monthOptions = MONTHS.map((label, value) => ({label, value}));
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
    <View style={{marginBottom: theme.spacing.md}}>
      {label ? (
        <AppText variant="label" color="textSecondary" style={{marginBottom: theme.spacing.xs}}>
          {label}
        </AppText>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: theme.components.input.height,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.components.input.radius,
          paddingHorizontal: theme.spacing.md,
          backgroundColor: theme.colors.inputBackground,
        }}>
        <AppText color={value ? 'text' : 'textMuted'}>
          {value ? formatDate(value) : 'Select date'}
        </AppText>
        <Icon name="calendar" size={18} color={theme.colors.textMuted} />
      </Pressable>

      <CustomBottomSheet visible={open} onClose={() => setOpen(false)} title={label ?? 'Select date'}>
        <View style={{flexDirection: 'row', columnGap: theme.spacing.sm}}>
          <ScrollPicker options={dayOptions} value={parts.d} onChange={d => setParts(p => ({...p, d}))} />
          <ScrollPicker options={monthOptions} value={parts.m} onChange={m => setParts(p => ({...p, m}))} />
          <ScrollPicker options={yearOptions} value={parts.y} onChange={y => setParts(p => ({...p, y}))} />
        </View>
        <CustomButton title="Confirm" onPress={confirm} />
      </CustomBottomSheet>
    </View>
  );
}
