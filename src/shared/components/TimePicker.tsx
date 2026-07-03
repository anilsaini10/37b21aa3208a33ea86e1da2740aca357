/**
 * TimePicker — dependency-free time field (24h). Value/onChange use "HH:mm".
 */
import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {useLanguage} from '../../core/i18n';
import {AppText} from './AppText';
import {Icon} from './Icon';
import {CustomBottomSheet} from './CustomBottomSheet';
import {CustomButton} from './CustomButton';
import {ScrollPicker} from './ScrollPicker';

export interface TimePickerProps {
  label?: string;
  value?: string;
  onChange: (hhmm: string) => void;
}

function parse(value?: string): {h: number; m: number} {
  if (value && /^\d{1,2}:\d{2}$/.test(value)) {
    const [h, m] = value.split(':').map(Number);
    return {h, m};
  }
  return {h: 9, m: 0};
}

export function TimePicker({label, value, onChange}: TimePickerProps): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(() => parse(value));
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
      columnGap: t2.spacing.md,
    },
  }));

  const hourOptions = Array.from({length: 24}, (_, i) => ({label: String(i).padStart(2, '0'), value: i}));
  const minuteOptions = Array.from({length: 12}, (_, i) => ({
    label: String(i * 5).padStart(2, '0'),
    value: i * 5,
  }));

  const confirm = () => {
    onChange(`${String(time.h).padStart(2, '0')}:${String(time.m).padStart(2, '0')}`);
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText variant="label" color="textSecondary" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <Pressable onPress={() => setOpen(true)} style={styles.field}>
        <AppText color={value ? 'text' : 'textMuted'}>{value ?? t('common_selectTime')}</AppText>
        <Icon name="clock" size={18} color={theme.colors.textMuted} />
      </Pressable>

      <CustomBottomSheet visible={open} onClose={() => setOpen(false)} title={label ?? t('common_selectTime')}>
        <View style={styles.pickerRow}>
          <ScrollPicker options={hourOptions} value={time.h} onChange={h => setTime(prev => ({...prev, h}))} />
          <ScrollPicker options={minuteOptions} value={time.m} onChange={m => setTime(prev => ({...prev, m}))} />
        </View>
        <CustomButton title={t('common_confirm')} onPress={confirm} />
      </CustomBottomSheet>
    </View>
  );
}
