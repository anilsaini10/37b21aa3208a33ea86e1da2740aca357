/**
 * CheckboxMultiSelect — generic multi-value select via a checkbox modal.
 *
 * Renders a `Select`-like tappable field; tapping it opens a modal listing
 * `options` as checkboxes (search box included once the list is long enough
 * to need it) plus an optional "type to add" row for values outside the
 * given list. Domain-agnostic — usable anywhere a form needs to collect
 * several values from a list (subjects, classes, tags, ...), not just teacher
 * subjects.
 */
import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {useLanguage} from '../../core/i18n';
import {AppText} from './AppText';
import {CustomInput} from './CustomInput';
import {CustomButton} from './CustomButton';
import {CustomModal} from './CustomModal';
import {Icon} from './Icon';
import {Row, Spacer} from './layout';

const SEARCH_THRESHOLD = 6;

export interface CheckboxMultiSelectProps {
  label?: string;
  value: string[];
  onChange: (values: string[]) => void;
  /** The full list of checkbox choices. */
  options: string[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  /** Lets the admin type a value that isn't in `options` and add it directly. Default true. */
  allowCustom?: boolean;
  /** Modal header — defaults to `label`. */
  modalTitle?: string;
}

export function CheckboxMultiSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required,
  allowCustom = true,
  modalTitle,
}: CheckboxMultiSelectProps): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customDraft, setCustomDraft] = useState('');

  const styles = useThemedStyles(t2 => ({
    wrapper: {marginBottom: t2.spacing.md},
    label: {marginBottom: t2.spacing.xs},
    fieldBase: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: t2.components.input.height,
      borderWidth: 1,
      borderRadius: t2.components.input.radius,
      paddingHorizontal: t2.spacing.md,
      backgroundColor: t2.colors.inputBackground,
    },
    fieldBorderNormal: {borderColor: t2.colors.border},
    fieldBorderError: {borderColor: t2.colors.error},
    chevron: {transform: [{rotate: '90deg'}]},
    errorText: {marginTop: t2.spacing.xs},
    optionsList: {maxHeight: 360},
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: t2.spacing.sm,
      columnGap: t2.spacing.sm,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: t2.radius.sm,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputWrap: {flex: 1, marginBottom: 0},
    addButton: {
      height: t2.components.input.height,
      width: t2.components.input.height,
      borderRadius: t2.components.input.radius,
      backgroundColor: t2.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

  // Merge in already-selected values that fell outside `options` (e.g. a custom
  // entry added in a previous session) so they still show up as checked.
  const allOptions = useMemo(() => {
    const extra = value.filter(v => !options.includes(v));
    return [...options, ...extra];
  }, [options, value]);

  const filteredOptions = search.trim()
    ? allOptions.filter(o => o.toLowerCase().includes(search.trim().toLowerCase()))
    : allOptions;

  const toggle = (item: string): void => {
    onChange(value.includes(item) ? value.filter(v => v !== item) : [...value, item]);
  };

  const addCustom = (): void => {
    const trimmed = customDraft.trim();
    if (!trimmed || value.includes(trimmed)) {
      return;
    }
    onChange([...value, trimmed]);
    setCustomDraft('');
  };

  const summary = value.length === 0 ? undefined : value.join(', ');

  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText variant="label" color="textSecondary" style={styles.label}>
          {label}
          {required ? <AppText variant="label" color="error"> *</AppText> : null}
        </AppText>
      ) : null}

      <Pressable
        onPress={() => {
          setSearch('');
          setOpen(true);
        }}
        style={[styles.fieldBase, error ? styles.fieldBorderError : styles.fieldBorderNormal]}>
        <AppText color={summary ? 'text' : 'textMuted'} numberOfLines={1} style={{flex: 1}}>
          {summary ?? placeholder ?? t('common_select')}
        </AppText>
        <Icon name="forward" size={18} color={theme.colors.textMuted} style={styles.chevron} />
      </Pressable>
      {error ? (
        <AppText variant="caption" color="error" style={styles.errorText}>
          {error}
        </AppText>
      ) : null}

      <CustomModal visible={open} onClose={() => setOpen(false)} title={modalTitle ?? label}>
        {allOptions.length > SEARCH_THRESHOLD ? (
          <CustomInput
            placeholder={t('common_search')}
            value={search}
            onChangeText={setSearch}
            containerStyle={{marginBottom: theme.spacing.sm}}
          />
        ) : null}

        <ScrollView style={styles.optionsList}>
          {filteredOptions.map(item => {
            const checked = value.includes(item);
            return (
              <Pressable key={item} onPress={() => toggle(item)} style={styles.optionRow}>
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: checked ? theme.colors.primary : 'transparent',
                      borderColor: checked ? theme.colors.primary : theme.colors.border,
                    },
                  ]}>
                  {checked ? <Icon name="check" size={14} color={theme.colors.onPrimary} /> : null}
                </View>
                <AppText variant="body" style={{flex: 1}}>
                  {item}
                </AppText>
              </Pressable>
            );
          })}
          {filteredOptions.length === 0 ? (
            <AppText variant="caption" color="textMuted">
              {t('common_noResults')}
            </AppText>
          ) : null}
        </ScrollView>

        {allowCustom ? (
          <>
            <Spacer size={theme.spacing.sm} />
            <Row gap={theme.spacing.sm} align="flex-start">
              <View style={styles.inputWrap}>
                <CustomInput
                  placeholder={t('common_typeToAdd')}
                  value={customDraft}
                  onChangeText={setCustomDraft}
                  onSubmitEditing={addCustom}
                  containerStyle={{marginBottom: 0}}
                />
              </View>
              <Pressable style={styles.addButton} onPress={addCustom} hitSlop={8}>
                <Icon name="add" size={20} color={theme.colors.onPrimary} />
              </Pressable>
            </Row>
          </>
        ) : null}

        <Spacer size={theme.spacing.md} />
        <CustomButton title={t('common_done')} onPress={() => setOpen(false)} />
      </CustomModal>
    </View>
  );
}
