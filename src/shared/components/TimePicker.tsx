/**
 * TimePicker — dependency-free time field (24h). Value/onChange use "HH:mm".
 */
import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {useTheme} from '../../core/theme';
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
        <AppText color={value ? 'text' : 'textMuted'}>{value ?? t('common_selectTime')}</AppText>
        <Icon name="clock" size={18} color={theme.colors.textMuted} />
      </Pressable>

      <CustomBottomSheet visible={open} onClose={() => setOpen(false)} title={label ?? t('common_selectTime')}>
        <View style={{flexDirection: 'row', columnGap: theme.spacing.md}}>
          <ScrollPicker options={hourOptions} value={time.h} onChange={h => setTime(prev => ({...prev, h}))} />
          <ScrollPicker options={minuteOptions} value={time.m} onChange={m => setTime(prev => ({...prev, m}))} />
        </View>
        <CustomButton title={t('common_confirm')} onPress={confirm} />
      </CustomBottomSheet>
    </View>
  );
}
