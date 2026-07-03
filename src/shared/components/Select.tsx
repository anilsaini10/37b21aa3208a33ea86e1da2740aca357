/** Dropdown select backed by a bottom sheet. */
import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {useLanguage} from '../../core/i18n';
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
  placeholder,
  error,
  onChange,
  required,
}: SelectProps): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  const styles = useThemedStyles(t2 => ({
    wrapper: {
      marginBottom: t2.spacing.md,
    },
    label: {
      marginBottom: t2.spacing.xs,
    },
    fieldBase: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: t2.components.input.height,
      borderWidth: 1,
      borderRadius: t2.components.input.radius,
      paddingHorizontal: t2.spacing.md,
      backgroundColor: t2.colors.inputBackground,
    },
    fieldBorderNormal: {
      borderColor: t2.colors.border,
    },
    fieldBorderError: {
      borderColor: t2.colors.error,
    },
    chevron: {
      transform: [{rotate: '90deg'}],
    },
    errorText: {
      marginTop: t2.spacing.xs,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: t2.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: t2.colors.divider,
    },
  }));

  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText variant="label" color="textSecondary" style={styles.label}>
          {label}
          {required ? <AppText variant="label" color="error"> *</AppText> : null}
        </AppText>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.fieldBase, error ? styles.fieldBorderError : styles.fieldBorderNormal]}>
        <AppText color={selected ? 'text' : 'textMuted'}>
          {selected?.label ?? placeholder ?? t('common_select')}
        </AppText>
        <Icon name="forward" size={18} color={theme.colors.textMuted} style={styles.chevron} />
      </Pressable>
      {error ? (
        <AppText variant="caption" color="error" style={styles.errorText}>
          {error}
        </AppText>
      ) : null}

      <CustomBottomSheet visible={open} onClose={() => setOpen(false)} title={label ?? t('common_select')}>
        {options.map(opt => {
          const isSel = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              style={styles.optionRow}>
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
