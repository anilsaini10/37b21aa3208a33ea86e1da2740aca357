/** Optional, searchable active-teacher picker for a paper's invigilator. */
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {AppText, CustomBottomSheet, Icon, SearchBar} from '../../../shared/components';
import {useTeachers} from '../../teachers/teachers.service';

const SEARCH_DEBOUNCE_MS = 350;

export interface InvigilatorValue {
  id: string;
  name: string;
}

export function InvigilatorSelect({
  label,
  value,
  onChange,
  error,
  disabled,
  compact,
}: {
  label?: string;
  value?: InvigilatorValue;
  /** `undefined` = cleared. */
  onChange: (value: InvigilatorValue | undefined) => void;
  error?: string;
  disabled?: boolean;
  /** Smaller field for dense rows (bulk builder). */
  compact?: boolean;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const [open, setOpen] = useState(false);

  const styles = useThemedStyles(t2 => ({
    wrapper: {marginBottom: compact ? t2.spacing.sm : t2.spacing.md},
    label: {marginBottom: t2.spacing.xs},
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: compact ? 40 : t2.components.input.height,
      borderWidth: 1,
      borderRadius: t2.components.input.radius,
      paddingHorizontal: t2.spacing.md,
      backgroundColor: t2.colors.inputBackground,
      borderColor: t2.colors.border,
    },
    fieldError: {borderColor: t2.colors.error},
    fieldDisabled: {opacity: 0.6},
    errorText: {marginTop: t2.spacing.xs},
  }));

  const pick = (next: InvigilatorValue | undefined): void => {
    onChange(next);
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText variant="label" color="textSecondary" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <Pressable
        onPress={disabled ? undefined : () => setOpen(true)}
        style={[styles.field, error ? styles.fieldError : null, disabled ? styles.fieldDisabled : null]}>
        <AppText color={value ? 'text' : 'textMuted'} numberOfLines={1} style={{flex: 1}}>
          {value?.name ?? t('dateSheet_invigilatorPlaceholder')}
        </AppText>
        <Icon name="teacher" size={16} color={theme.colors.textMuted} />
      </Pressable>
      {error ? (
        <AppText variant="caption" color="error" style={styles.errorText}>
          {error}
        </AppText>
      ) : null}

      <CustomBottomSheet visible={open} onClose={() => setOpen(false)} title={t('dateSheet_invigilator')}>
        {/* Mounted only while open, so the teacher list isn't fetched until it's needed. */}
        {open ? <TeacherOptions value={value} onPick={pick} /> : null}
      </CustomBottomSheet>
    </View>
  );
}

function TeacherOptions({
  value,
  onPick,
}: {
  value?: InvigilatorValue;
  onPick: (value: InvigilatorValue | undefined) => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search]);

  const {data, isLoading, isError} = useTeachers({
    status: 'ACTIVE',
    pageSize: 100,
    search: debouncedSearch || undefined,
  });
  const teachers = data?.items ?? [];

  const styles = useThemedStyles(t2 => ({
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: t2.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: t2.colors.divider,
    },
    searchWrap: {marginBottom: t2.spacing.sm},
    state: {paddingVertical: t2.spacing.lg, alignItems: 'center'},
  }));

  return (
    <>
      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('dateSheet_searchTeacher')} />
      </View>
      <Pressable onPress={() => onPick(undefined)} style={styles.optionRow}>
        <AppText color="textMuted">{t('dateSheet_noInvigilator')}</AppText>
        {!value ? <Icon name="check" size={16} color={theme.colors.primary} /> : null}
      </Pressable>
      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.state}>
          <AppText variant="caption" color="error">
            {t('common_somethingWentWrong')}
          </AppText>
        </View>
      ) : teachers.length === 0 ? (
        <View style={styles.state}>
          <AppText variant="caption" color="textMuted">
            {t('common_noResults')}
          </AppText>
        </View>
      ) : (
        teachers.map(teacher => {
          const isSel = teacher.id === value?.id;
          return (
            <Pressable
              key={teacher.id}
              onPress={() => onPick({id: teacher.id, name: teacher.name})}
              style={styles.optionRow}>
              <View style={{flex: 1}}>
                <AppText style={{color: isSel ? theme.colors.primary : theme.colors.text}}>{teacher.name}</AppText>
                {teacher.employeeId ? (
                  <AppText variant="label" color="textMuted">
                    {teacher.employeeId}
                  </AppText>
                ) : null}
              </View>
              {isSel ? <Icon name="check" size={16} color={theme.colors.primary} /> : null}
            </Pressable>
          );
        })
      )}
    </>
  );
}
