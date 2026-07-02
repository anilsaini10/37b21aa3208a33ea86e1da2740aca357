/** Dropdown select backed by a bottom sheet. */
import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {useTheme} from '../../core/theme';
import {AppText} from './AppText';
import {Icon} from './Icon';
import {CustomBottomSheet} from './CustomBottomSheet';
import type {SelectOption} from '../types';

export interface SelectProps {
  label?: string;
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function Select({
  label,
  value,
  options,
  placeholder = 'Select…',
  error,
  onChange,
  required,
}: SelectProps): React.JSX.Element {
  const {theme} = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <View style={{marginBottom: theme.spacing.md}}>
      {label ? (
        <AppText variant="label" color="textSecondary" style={{marginBottom: theme.spacing.xs}}>
          {label}
          {required ? <AppText variant="label" color="error"> *</AppText> : null}
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
          borderColor: error ? theme.colors.error : theme.colors.border,
          borderRadius: theme.components.input.radius,
          paddingHorizontal: theme.spacing.md,
          backgroundColor: theme.colors.inputBackground,
        }}>
        <AppText color={selected ? 'text' : 'textMuted'}>{selected?.label ?? placeholder}</AppText>
        <Icon name="forward" size={18} color={theme.colors.textMuted} style={{transform: [{rotate: '90deg'}]}} />
      </Pressable>
      {error ? (
        <AppText variant="caption" color="error" style={{marginTop: theme.spacing.xs}}>
          {error}
        </AppText>
      ) : null}

      <CustomBottomSheet visible={open} onClose={() => setOpen(false)} title={label ?? 'Select'}>
        {options.map(opt => {
          const isSel = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: theme.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.divider,
              }}>
              <AppText style={{color: isSel ? theme.colors.primary : theme.colors.text}}>
                {opt.label}
              </AppText>
              {isSel ? <Icon name="check" size={16} color={theme.colors.primary} /> : null}
            </Pressable>
          );
        })}
      </CustomBottomSheet>
    </View>
  );
}
